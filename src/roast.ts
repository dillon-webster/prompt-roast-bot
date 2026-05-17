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
