# Discord Prompt Roast Bot — Design Spec

## Overview

A Discord bot that watches a single dedicated channel and roasts every AI prompt posted there. Targeted at vibe coders — it mocks the quality, vagueness, over-engineering, or delusion present in each prompt. Built with TypeScript, discord.js, and the Anthropic SDK. Deployed to Railway.

## Architecture

A single long-running Node.js process connects to Discord via the Gateway (WebSocket). On every message in the configured channel, it calls the Anthropic API with a savage roast system prompt and sends the response back as a reply to that message.

```
Discord Gateway → discord.js → message handler → Anthropic SDK → reply
```

## Components

### `src/index.ts`
Entry point. Loads env vars and starts the bot.

### `src/bot.ts`
Sets up the discord.js client with the `GuildMessages` and `MessageContent` intents. Listens for `messageCreate` events. Filters to the configured channel ID and ignores the bot's own messages. Passes message content to `roast.ts` and sends the result as a reply.

### `src/roast.ts`
Calls the Anthropic API using the SDK. Sends the user's message as the user turn with a fixed savage system prompt. Returns the roast string.

## Roast Persona

System prompt:

> "You are a savage roast comedian who specializes in dunking on AI prompts written by vibe coders. When given a prompt, roast it mercilessly — mock the vagueness, the over-engineering, the desperate hand-holding, the delusion that 'just vibe it' is a strategy. Be cutting, specific, and funny. Keep it to 1-3 sentences. Never break character."

Roasts are capped at 1-3 sentences to stay punchy.

## Configuration (Environment Variables)

| Variable | Description |
|---|---|
| `DISCORD_BOT_TOKEN` | Bot token from Discord Developer Portal |
| `DISCORD_CHANNEL_ID` | ID of the channel to watch |
| `ANTHROPIC_API_KEY` | Anthropic API key |

## Error Handling

- If the Anthropic API call fails, the bot replies with: *"Even my roast generator refuses to engage with this prompt."*
- The bot ignores its own messages to prevent reply loops.

## Deployment

Railway auto-detects Node.js projects via `package.json`. The `start` script runs the compiled output. Env vars are set in Railway's dashboard. No database or persistent storage required.

## Out of Scope

- Multiple channels or configurable personas
- Slash commands
- Message history or context between roasts
- Rate limiting (assumed low-volume internal Discord)
