import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const profileSchema = z.object({
    fullName: z.string().min(2, "Name is required").max(100).optional(),
    occupation: z.string().max(100).optional(),
    gender: z.string().max(20).optional(),
    dateOfBirth: z.string().max(10).optional(),
    phone: z.string().max(30).optional(),
    taxId: z.string().max(50).optional(),
    address: z.string().max(200).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    country: z.string().max(100).optional(),
    zipCode: z.string().max(20).optional(),
    nokName: z.string().max(100).optional(),
    nokPhone: z.string().max(30).optional(),
    nokRelationship: z.string().max(50).optional(),
    nokEmail: z.string().email("Invalid email").max(100).optional().or(z.literal("")),
    nokAddress: z.string().max(200).optional(),
    image: z.string().optional(),
    passportUrl: z.string().optional(),
    idCardUrl: z.string().optional(),
});

describe('profileSchema', () => {
  it('accepts empty object (all optional)', () => {
    expect(profileSchema.safeParse({}).success).toBe(true);
  });

  it('accepts valid fullName', () => {
    expect(profileSchema.safeParse({ fullName: 'Jane' }).success).toBe(true);
  });

  it('rejects long fullName', () => {
    expect(profileSchema.safeParse({ fullName: 'A'.repeat(101) }).success).toBe(false);
  });

  it('rejects invalid nokEmail', () => {
    expect(profileSchema.safeParse({ nokEmail: 'bad' }).success).toBe(false);
  });

  it('accepts empty string as nokEmail', () => {
    expect(profileSchema.safeParse({ nokEmail: '' }).success).toBe(true);
  });

  it('rejects long phone', () => {
    expect(profileSchema.safeParse({ phone: '1'.repeat(31) }).success).toBe(false);
  });

  it('accepts valid optional fields combination', () => {
    expect(profileSchema.safeParse({
      fullName: 'John',
      occupation: 'Engineer',
      phone: '1234567890'
    }).success).toBe(true);
  });
});