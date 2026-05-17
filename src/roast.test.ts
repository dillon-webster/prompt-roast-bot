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
