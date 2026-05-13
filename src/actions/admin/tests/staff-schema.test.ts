import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const UserRole = {
  CLIENT: 'CLIENT',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
  SUPPORT: 'SUPPORT',
} as const;

const staffCreateSchema = z.object({
  email: z.string().email("Invalid email address").max(100),
  fullName: z.string().min(2, "Name is required").max(100),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.nativeEnum(UserRole).refine(val => val !== UserRole.SUPER_ADMIN, {
    message: "Cannot create Super Admin via web portal."
  }),
});

const promoteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.nativeEnum(UserRole).refine(val => val !== UserRole.SUPER_ADMIN, {
    message: "Cannot promote to Super Admin via web portal."
  }),
});

describe('staffCreateSchema', () => {
  const validStaff = {
    email: 'newadmin@trust.com',
    fullName: 'Jane Admin',
    password: 'secure123',
    role: UserRole.ADMIN,
  };

  it('accepts valid staff creation', () => {
    expect(staffCreateSchema.safeParse(validStaff).success).toBe(true);
  });

  it('rejects creating a Super Admin', () => {
    const s = staffCreateSchema.safeParse({ ...validStaff, role: UserRole.SUPER_ADMIN });
    expect(s.success).toBe(false);
    if (!s.success) expect(s.error.issues[0].message).toMatch(/Cannot create Super Admin/i);
  });

  it('rejects invalid email', () => {
    const s = staffCreateSchema.safeParse({ ...validStaff, email: 'not-email' });
    expect(s.success).toBe(false);
  });

  it('rejects short fullName', () => {
    const s = staffCreateSchema.safeParse({ ...validStaff, fullName: 'A' });
    expect(s.success).toBe(false);
  });
});

describe('promoteSchema', () => {
  it('accepts valid promotion', () => {
    const s = promoteSchema.safeParse({ email: 'user@trust.com', role: UserRole.ADMIN });
    expect(s.success).toBe(true);
  });

  it('rejects promotion to Super Admin', () => {
    const s = promoteSchema.safeParse({ email: 'user@trust.com', role: UserRole.SUPER_ADMIN });
    expect(s.success).toBe(false);
  });
});