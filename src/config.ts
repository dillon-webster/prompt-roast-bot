import 'dotenv/config';

function loadConfig() {
  const token = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_CHANNEL_ID;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!token) throw new Error('DISCORD_BOT_TOKEN is required');
  if (!channelId) throw new Error('DISCORD_CHANNEL_ID is required');
  if (!anthropicKey) throw new Error('ANTHROPIC_API_KEY is required');

  return { token, channelId, anthropicKey };
}

export const config = loadConfig();
