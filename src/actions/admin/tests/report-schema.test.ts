import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const reportSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  summary: z.string().max(2000).optional(),
  fileUrl: z.string().url("Invalid URL").max(500),
  type: z.string().max(50).optional(),
  date: z.string().optional(),
});

describe('reportSchema', () => {
  const validReport = { title: 'Q1 Report', fileUrl: 'https://example.com/report.pdf' };

  it('accepts valid report', () => {
    expect(reportSchema.safeParse(validReport).success).toBe(true);
  });
  it('rejects missing title', () => {
    expect(reportSchema.safeParse({ ...validReport, title: '' }).success).toBe(false);
  });
  it('rejects invalid URL', () => {
    expect(reportSchema.safeParse({ ...validReport, fileUrl: 'not-a-url' }).success).toBe(false);
  });
  it('rejects missing fileUrl', () => {
    expect(reportSchema.safeParse({ title: 'Report' }).success).toBe(false);
  });
  it('accepts optional summary and type', () => {
    expect(reportSchema.safeParse({ ...validReport, summary: 'Summary text', type: 'Finance' }).success).toBe(true);
  });
  it('rejects overly long title', () => {
    expect(reportSchema.safeParse({ ...validReport, title: 'A'.repeat(201) }).success).toBe(false);
  });
});