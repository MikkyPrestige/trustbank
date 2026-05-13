import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const cardIdSchema = z.string().min(1, "Card ID is required");

describe('cardIdSchema', () => {
  it('accepts valid ID', () => {
    expect(cardIdSchema.safeParse('card123').success).toBe(true);
  });
  it('rejects empty string', () => {
    const s = cardIdSchema.safeParse('');
    expect(s.success).toBe(false);
    if (!s.success) expect(s.error.issues[0].message).toBe("Card ID is required");
  });
});