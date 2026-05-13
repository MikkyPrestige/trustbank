import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const passwordChangesSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

describe('passwordChangesSchema', () => {
  it('accepts matching passwords with sufficient length', () => {
    const result = passwordChangesSchema.safeParse({
      password: 'secret123',
      confirmPassword: 'secret123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects short password', () => {
    const result = passwordChangesSchema.safeParse({
      password: '12345',
      confirmPassword: '12345',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/at least 6 characters/i);
    }
  });

  it('rejects mismatched passwords', () => {
    const result = passwordChangesSchema.safeParse({
      password: 'secret123',
      confirmPassword: 'different',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/passwords do not match/i);
    }
  });
});