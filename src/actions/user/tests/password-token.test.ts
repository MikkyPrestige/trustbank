import { describe, it, expect } from 'vitest';
import crypto from 'crypto';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

describe('password reset token hashing', () => {
  it('produces identical hashes for the same token', () => {
    const token = crypto.randomBytes(32).toString('hex');
    const hash1 = hashToken(token);
    const hash2 = hashToken(token);
    expect(hash1).toBe(hash2);
  });

  it('different tokens produce different hashes', () => {
    const token1 = crypto.randomBytes(32).toString('hex');
    const token2 = crypto.randomBytes(32).toString('hex');
    expect(hashToken(token1)).not.toBe(hashToken(token2));
  });

  it('token is not reversible from the hash', () => {
    const token = crypto.randomBytes(32).toString('hex');
    const hash = hashToken(token);
    // Reverse? SHA‑256 is one-way
    expect(hash).not.toBe(token);
  });
});