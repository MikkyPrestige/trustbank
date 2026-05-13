import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const branchSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  address: z.string().min(1, "Address is required").max(200),
  city: z.string().min(1, "City is required").max(100),
  phone: z.string().max(30).optional(),
  email: z.string().email("Invalid email").max(100).optional().or(z.literal('')),
  hours: z.string().max(200).optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  hasAtm: z.boolean().optional(),
  hasDriveThru: z.boolean().optional(),
  hasNotary: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

describe('branchSchema', () => {
  const validBranch = {
    name: 'Downtown Branch',
    address: '123 Main St',
    city: 'Metropolis',
  };

  it('accepts valid branch', () => {
    expect(branchSchema.safeParse(validBranch).success).toBe(true);
  });
  it('rejects missing name', () => {
    expect(branchSchema.safeParse({ ...validBranch, name: '' }).success).toBe(false);
  });
  it('rejects long name', () => {
    expect(branchSchema.safeParse({ ...validBranch, name: 'A'.repeat(101) }).success).toBe(false);
  });
  it('rejects invalid email', () => {
    expect(branchSchema.safeParse({ ...validBranch, email: 'bad' }).success).toBe(false);
  });
  it('accepts empty string email', () => {
    expect(branchSchema.safeParse({ ...validBranch, email: '' }).success).toBe(true);
  });
  it('accepts optional boolean fields', () => {
    expect(branchSchema.safeParse({ ...validBranch, hasAtm: true, isActive: true }).success).toBe(true);
  });
});