import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const generatorSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  type: z.enum(['CREDIT', 'DEBIT', 'MIXED'], { message: "Invalid transaction type" }),
  totalAmount: z.coerce.number().positive("Amount must be positive"),
  displayAmount: z.coerce.number().optional(),
  displayCurrency: z.string().optional(),
  count: z.coerce.number().int("Count must be a whole number").positive("Count must be positive").max(100, "Maximum 100 transactions at once"),
  customNote: z.string().max(200, "Note must be 200 characters or less").optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

describe('generatorSchema', () => {
  const validGen = {
    accountId: 'acc123',
    type: 'CREDIT',
    totalAmount: '1000',
    count: '10',
  };

  it('accepts valid generation config', () => {
    expect(generatorSchema.safeParse(validGen).success).toBe(true);
  });

  it('rejects missing accountId', () => {
    expect(generatorSchema.safeParse({ ...validGen, accountId: '' }).success).toBe(false);
  });

  it('rejects invalid type', () => {
    expect(generatorSchema.safeParse({ ...validGen, type: 'BOTH' }).success).toBe(false);
  });

  it('rejects zero totalAmount', () => {
    expect(generatorSchema.safeParse({ ...validGen, totalAmount: '0' }).success).toBe(false);
  });

  it('rejects negative count', () => {
    expect(generatorSchema.safeParse({ ...validGen, count: '-5' }).success).toBe(false);
  });

  it('rejects count above 100', () => {
    expect(generatorSchema.safeParse({ ...validGen, count: '101' }).success).toBe(false);
  });

  it('rejects non-integer count', () => {
    expect(generatorSchema.safeParse({ ...validGen, count: '5.5' }).success).toBe(false);
  });

  it('rejects overly long customNote', () => {
    expect(generatorSchema.safeParse({ ...validGen, customNote: 'A'.repeat(201) }).success).toBe(false);
  });
});