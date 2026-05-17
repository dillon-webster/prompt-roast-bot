# Discord Prompt Roast Bot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Discord bot that watches a single channel and roasts every AI prompt posted there using Claude.

**Architecture:** A long-running Node.js process connects to Discord via Gateway, listens for messages in a configured channel, calls the Anthropic API with a savage roast system prompt, and replies to the message. Config is loaded from env vars at startup and validated immediately so the process fails fast if misconfigured.

**Tech Stack:** TypeScript, discord.js v14, @anthropic-ai/sdk, dotenv, Jest + ts-jest for tests

---

## File Map

| File | Responsibility |
|---|---|
| `src/config.ts` | Load and validate env vars, export typed config |
| `src/roast.ts` | Call Anthropic API, return roast string |
| `src/bot.ts` | discord.js client setup, message event handler |
| `src/index.ts` | Entry point — loads config, starts bot |
| `src/roast.test.ts` | Unit tests for roast function |
| `src/bot.test.ts` | Unit tests for message filtering logic |
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript compiler config |
| `.env.example` | Document required env vars |
| `.gitignore` | Exclude node_modules, dist, .env |

---

### Task 1: Project scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.env.example`
- Create: `.gitignore`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "discord-prompt-roast",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "test": "jest"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.52.0",
    "discord.js": "^14.18.0",
    "dotenv": "^16.5.0"
  },
  "devDependencies": {
    "@types/jest": "^29.5.14",
    "@types/node": "^22.15.18",
    "jest": "^29.7.0",
    "ts-jest": "^29.3.2",
    "ts-node": "^10.9.2",
    "typescript": "^5.8.3"
  },
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "node"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

- [ ] **Step 3: Create .env.example**

```
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CHANNEL_ID=your_channel_id_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

- [ ] **Step 4: Create .gitignore**

```
node_modules/
dist/
.env
```

- [ ] **Step 5: Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 6: Commit**

```bash
git add package.json tsconfig.json .env.example .gitignore
git commit -m "chore: project scaffold"
```

---

### Task 2: Environment config

**Files:**
- Create: `src/config.ts`

- [ ] **Step 1: Create src/config.ts**

```typescript
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/config.ts
git commit -m "feat: env config with validation"
```

---

### Task 3: Roast function + tests

**Files:**
- Create: `src/roast.ts`
- Create: `src/roast.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/roast.test.ts`:

```typescript
import { roastPrompt } from './roast';
import Anthropic from '@anthropic-ai/sdk';

const mockCreate = jest.fn();
const mockClient = {
  messages: { create: mockCreate },
} as unknown as Anthropic;

beforeEach(() => jest.clearAllMocks());

describe('roastPrompt', () => {
  it('returns roast text from API response', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'What a terrible prompt.' }],
    });

    const result = await roastPrompt(mockClient, 'build me an app');

    expect(result).toBe('What a terrible prompt.');
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-sonnet-4-6',
        messages: [{ role: 'user', content: 'build me an app' }],
      })
    );
  });

  it('returns fallback when API throws', async () => {
    mockCreate.mockRejectedValue(new Error('API error'));

    const result = await roastPrompt(mockClient, 'some prompt');

    expect(result).toBe(
      'Even my roast generator refuses to engage with this prompt.'
    );
  });

  it('returns fallback when response has no text block', async () => {
    mockCreate.mockResolvedValue({ content: [] });

    const result = await roastPrompt(mockClient, 'some prompt');

    expect(result).toBe(
      'Even my roast generator refuses to engage with this prompt.'
    );
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- roast.test.ts
```

Expected: FAIL — `Cannot find module './roast'`

- [ ] **Step 3: Implement src/roast.ts**

```typescript
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT =
  "You are a savage roast comedian who specializes in dunking on AI prompts written by vibe coders. When given a prompt, roast it mercilessly — mock the vagueness, the over-engineering, the desperate hand-holding, the delusion that 'just vibe it' is a strategy. Be cutting, specific, and funny. Keep it to 1-3 sentences. Never break character.";

const FALLBACK =
  'Even my roast generator refuses to engage with this prompt.';

export async function roastPrompt(
  client: Anthropic,
  prompt: string
): Promise<string> {
  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const block = message.content[0];
    if (block && block.type === 'text') return block.text;
    return FALLBACK;
  } catch {
    return FALLBACK;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- roast.test.ts
```

Expected: PASS — 3 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/roast.ts src/roast.test.ts
git commit -m "feat: roast function with Anthropic SDK"
```

---

### Task 4: Bot message handler + tests

**Files:**
- Create: `src/bot.ts`
- Create: `src/bot.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/bot.test.ts`:

```typescript
import { shouldHandle } from './bot';

describe('shouldHandle', () => {
  it('returns true for a non-bot message in the target channel', () => {
    expect(shouldHandle(false, '123', '123')).toBe(true);
  });

  it('returns false for a bot message', () => {
    expect(shouldHandle(true, '123', '123')).toBe(false);
  });

  it('returns false for a message in a different channel', () => {
    expect(shouldHandle(false, '456', '123')).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- bot.test.ts
```

Expected: FAIL — `Cannot find module './bot'`

- [ ] **Step 3: Implement src/bot.ts**

```typescript
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- bot.test.ts
```

Expected: PASS — 3 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/bot.ts src/bot.test.ts
git commit -m "feat: discord bot with message handler"
```

---

### Task 5: Entry point and full test suite

**Files:**
- Create: `src/index.ts`

- [ ] **Step 1: Create src/index.ts**

```typescript
import { config } from './config';
import { createBot } from './bot';

createBot(config.token, config.channelId, config.anthropicKey);
```

- [ ] **Step 2: Run full test suite**

```bash
npm test
```

Expected: PASS — all 6 tests passing.

- [ ] **Step 3: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/index.ts
git commit -m "feat: wire up entry point"
```

---

### Task 6: Railway deployment config

**Files:**
- Modify: `package.json` — verify start script is correct (already set in Task 1)

Railway auto-detects Node.js projects and runs `npm run build` then `npm start`. No additional config file is needed. Set the following env vars in the Railway dashboard before deploying:

- `DISCORD_BOT_TOKEN`
- `DISCORD_CHANNEL_ID`
- `ANTHROPIC_API_KEY`

- [ ] **Step 1: Verify build produces runnable output**

Copy `.env.example` to `.env` and fill in real values, then:

```bash
npm run build
```

Expected: `dist/` directory created with `index.js`, `config.js`, `bot.js`, `roast.js`.

- [ ] **Step 2: Verify bot starts (smoke test)**

```bash
npm start
```

Expected: `Logged in as <BotName>#XXXX` printed to console. Post a message in the configured channel and confirm the bot replies with a roast.

- [ ] **Step 3: Commit**

```bash
git add dist/ -f  # only if you want to commit dist — alternatively rely on Railway's build step
git commit -m "chore: verify railway deployment"
```

> Note: Railway runs `npm run build` automatically on deploy, so you do NOT need to commit `dist/`. Add `dist/` to `.gitignore` if preferred.

---

## Self-Review

**Spec coverage:**
- [x] TypeScript/Node.js — Task 1
- [x] Watches single channel — Task 4 (`shouldHandle`)
- [x] Every message roasted — Task 4 (`MessageCreate` handler)
- [x] Savage vibe-coder-specific persona — Task 3 (`SYSTEM_PROMPT`)
- [x] Fallback on API failure — Task 3
- [x] Ignores bot messages — Task 4
- [x] Railway deployment — Task 6
- [x] Env var config — Task 2

**Placeholder scan:** None found. All steps include complete code.

**Type consistency:** `roastPrompt(client: Anthropic, prompt: string): Promise<string>` used consistently across Tasks 3, 4, and 5. `shouldHandle` exported from `bot.ts` and tested in `bot.test.ts`.
