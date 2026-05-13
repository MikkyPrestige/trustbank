import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const beneficiarySchema = z.object({
    accountName: z.string().min(2, "Account Name is required").max(100),
    accountNumber: z.string().min(6, "Account Number must be valid").max(30),
    bankName: z.string().min(2, "Bank Name is required").max(100),
    swiftCode: z.string().max(11).optional(),
    routingNumber: z.string().max(20).optional(),
});

describe('beneficiarySchema', () => {
  const validBeneficiary = {
    accountName: 'John Doe',
    accountNumber: '123456789',
    bankName: 'Global Trust Bank',
  };

  it('accepts valid beneficiary', () => {
    expect(beneficiarySchema.safeParse(validBeneficiary).success).toBe(true);
  });

  it('rejects short accountName', () => {
    const s = beneficiarySchema.safeParse({ ...validBeneficiary, accountName: 'A' });
    expect(s.success).toBe(false);
  });

  it('rejects long accountName', () => {
    const s = beneficiarySchema.safeParse({ ...validBeneficiary, accountName: 'A'.repeat(101) });
    expect(s.success).toBe(false);
  });

  it('rejects short accountNumber', () => {
    const s = beneficiarySchema.safeParse({ ...validBeneficiary, accountNumber: '12345' });
    expect(s.success).toBe(false);
  });

  it('rejects overly long swiftCode', () => {
    const s = beneficiarySchema.safeParse({ ...validBeneficiary, swiftCode: 'A'.repeat(12) });
    expect(s.success).toBe(false);
  });

  it('accepts optional routingNumber', () => {
    const s = beneficiarySchema.safeParse({ ...validBeneficiary, routingNumber: '123456789' });
    expect(s.success).toBe(true);
  });

  it('rejects overly long routingNumber', () => {
    const s = beneficiarySchema.safeParse({ ...validBeneficiary, routingNumber: 'A'.repeat(21) });
    expect(s.success).toBe(false);
  });
});