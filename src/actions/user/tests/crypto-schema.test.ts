import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const tradeSchema = z.object({
  type: z.enum(["BUY", "SELL"], { message: "Invalid trade type" }),
  currency: z.string().min(1).max(10),
  amount: z.coerce.number().positive("Amount must be positive"),
  displayAmount: z.string().optional(),
  displayCurrency: z.string().optional(),
});

const transferCryptoSchema = z.object({
  symbol: z.string().min(1).max(10),
  amount: z.coerce.number().positive("Amount must be positive"),
  recipient: z.string().min(1).max(100),
  pin: z.string().length(4, "PIN must be 4 digits"),
});

const walletSchema = z.object({
  symbol: z.string().min(1).max(10),
});

describe('tradeSchema', () => {
  const validTrade = { type: 'BUY', currency: 'BTC', amount: '100' };
  it('accepts valid trade', () => {
    expect(tradeSchema.safeParse(validTrade).success).toBe(true);
  });
  it('rejects invalid trade type', () => {
    expect(tradeSchema.safeParse({ ...validTrade, type: 'HOLD' }).success).toBe(false);
  });
  it('rejects zero amount', () => {
    expect(tradeSchema.safeParse({ ...validTrade, amount: '0' }).success).toBe(false);
  });
});

describe('transferCryptoSchema', () => {
  const validTransfer = { symbol: 'ETH', amount: '2', recipient: '0xABC', pin: '1234' };
  it('accepts valid crypto transfer', () => {
    expect(transferCryptoSchema.safeParse(validTransfer).success).toBe(true);
  });
  it('rejects short pin', () => {
    expect(transferCryptoSchema.safeParse({ ...validTransfer, pin: '12' }).success).toBe(false);
  });
  it('rejects missing recipient', () => {
    expect(transferCryptoSchema.safeParse({ ...validTransfer, recipient: '' }).success).toBe(false);
  });
});

describe('walletSchema', () => {
  it('accepts valid symbol', () => {
    expect(walletSchema.safeParse({ symbol: 'BTC' }).success).toBe(true);
  });
  it('rejects empty symbol', () => {
    expect(walletSchema.safeParse({ symbol: '' }).success).toBe(false);
  });
  it('rejects overly long symbol', () => {
    expect(walletSchema.safeParse({ symbol: 'A'.repeat(11) }).success).toBe(false);
  });
});