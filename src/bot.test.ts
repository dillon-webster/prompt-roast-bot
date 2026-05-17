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
