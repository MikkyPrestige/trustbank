import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email("Invalid email address").max(100),
  fullName: z.string().min(2, "Name is required").max(100),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().max(30, "Phone must be 30 characters or less").optional(),
  address: z.string().max(200, "Address must be 200 characters or less").optional(),
  city: z.string().max(100, "City must be 100 characters or less").optional(),
  country: z.string().max(100, "Country must be 100 characters or less").optional(),
  zipCode: z.string().max(20, "Zip code must be 20 characters or less").optional(),
  occupation: z.string().max(100, "Occupation must be 100 characters or less").optional(),
  gender: z.string().max(20, "Gender must be 20 characters or less").optional(),
  taxId: z.string().max(50, "Tax ID must be 50 characters or less").optional(),
  dateOfBirth: z.string().optional(),
});

describe('createUserSchema', () => {
  const validUser = {
    email: 'newuser@trust.com',
    fullName: 'Jane Doe',
    password: 'secure123',
  };

  it('accepts valid user', () => {
    expect(createUserSchema.safeParse(validUser).success).toBe(true);
  });
  it('rejects invalid email', () => {
    expect(createUserSchema.safeParse({ ...validUser, email: 'bad' }).success).toBe(false);
  });
  it('rejects short fullName', () => {
    expect(createUserSchema.safeParse({ ...validUser, fullName: 'A' }).success).toBe(false);
  });
  it('rejects short password', () => {
    expect(createUserSchema.safeParse({ ...validUser, password: '12345' }).success).toBe(false);
  });
  it('accepts optional fields within limits', () => {
    expect(createUserSchema.safeParse({
      ...validUser,
      phone: '1234567890',
      city: 'New York',
    }).success).toBe(true);
  });
  it('rejects overly long phone', () => {
    expect(createUserSchema.safeParse({ ...validUser, phone: '1'.repeat(31) }).success).toBe(false);
  });
  it('rejects overly long address', () => {
    expect(createUserSchema.safeParse({ ...validUser, address: 'A'.repeat(201) }).success).toBe(false);
  });
});