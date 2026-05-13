import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const registerSchema = z.object({
  fullName: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Invalid email").max(100),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
  pin: z.string().length(4, "PIN must be exactly 4 digits"),
  phone: z.string().max(30).optional(),
  dateOfBirth: z.string().max(10).optional(),
  gender: z.string().max(20).optional(),
  occupation: z.string().max(100).optional(),
  taxId: z.string().max(50).optional(),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  address: z.string().max(200).optional(),
  zipCode: z.string().max(20).optional(),
  nokName: z.string().max(100).optional(),
  nokPhone: z.string().max(30).optional(),
  nokEmail: z.string().email("Invalid NOK email").max(100).optional().or(z.literal("")),
  nokAddress: z.string().max(200).optional(),
  nokRelationship: z.string().max(50).optional(),
  docType: z.string().max(20).optional(),
  currency: z.string().max(10).optional(),
  callbackUrl: z.string().max(500).optional(),
});

describe('registerSchema', () => {
  const validData = {
    fullName: 'John Doe',
    email: 'john@example.com',
    password: 'secret123',
    pin: '1234',
  };

  it('accepts valid registration data', () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects short fullName', () => {
    const result = registerSchema.safeParse({ ...validData, fullName: 'A' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({ ...validData, email: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('rejects pin that is not exactly 4 digits', () => {
    const result = registerSchema.safeParse({ ...validData, pin: '12' });
    expect(result.success).toBe(false);
  });

  it('rejects fullName exceeding max length', () => {
    const result = registerSchema.safeParse({ ...validData, fullName: 'A'.repeat(101) });
    expect(result.success).toBe(false);
  });
});