import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const jobSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  department: z.string().min(1, "Department is required").max(100),
  location: z.string().min(1, "Location is required").max(100),
  type: z.string().max(50).optional(),
  description: z.string().max(5000).optional(),
  isActive: z.boolean().optional(),
});

describe('jobSchema', () => {
  const validJob = { title: 'Developer', department: 'Engineering', location: 'Remote' };

  it('accepts valid job posting', () => {
    expect(jobSchema.safeParse(validJob).success).toBe(true);
  });
  it('rejects missing title', () => {
    expect(jobSchema.safeParse({ ...validJob, title: '' }).success).toBe(false);
  });
  it('rejects missing department', () => {
    expect(jobSchema.safeParse({ ...validJob, department: '' }).success).toBe(false);
  });
  it('rejects missing location', () => {
    expect(jobSchema.safeParse({ ...validJob, location: '' }).success).toBe(false);
  });
  it('accepts optional type and description', () => {
    expect(jobSchema.safeParse({ ...validJob, type: 'Full-time', description: 'A great job.' }).success).toBe(true);
  });
  it('rejects overly long description', () => {
    expect(jobSchema.safeParse({ ...validJob, description: 'A'.repeat(5001) }).success).toBe(false);
  });
});