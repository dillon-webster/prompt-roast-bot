import { Client, GatewayIntentBits, Events } from 'discord.js';
import Anthropic from '@anthropic-ai/sdk';
import { roastPrompt } from './roast';

export function shouldHandle(
  authorIsBot: boolean,
  messageChannelId: string,
  targetChannelId: string
): boolean {
  return !authorIsBot && messageChannelId === targetChannelId;
}

export function createBot(
  token: string,
  channelId: string,
  anthropicKey: string
): Client {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  const anthropic = new Anthropic({ apiKey: anthropicKey });

  client.on(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user?.tag}`);
  });

  client.on(Events.MessageCreate, async (message) => {
if (!shouldHandle(message.author.bot, message.channelId, channelId)) return;

    const roast = await roastPrompt(anthropic, message.content);
    await message.reply(roast);
  });

  client.login(token);
  return client;
}
