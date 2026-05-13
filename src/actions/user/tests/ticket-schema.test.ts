import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const ticketSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters").max(100),
  message: z.string().min(10, "Please describe your issue in detail (min 10 chars).").max(2000),
  priority: z.enum(["LOW", "NORMAL", "HIGH"]).optional(),
});

const replySchema = z.object({
  ticketId: z.string().min(1, "Ticket ID is required"),
  message: z.string().min(1, "Message cannot be empty").max(2000),
});

describe('ticketSchema (create)', () => {
  const validTicket = {
    subject: 'Login Issue',
    message: 'I cannot log in from my phone. This has been happening for two days.',
  };

  it('accepts valid ticket', () => {
    expect(ticketSchema.safeParse(validTicket).success).toBe(true);
  });

  it('rejects short subject', () => {
    const s = ticketSchema.safeParse({ ...validTicket, subject: 'Hi' });
    expect(s.success).toBe(false);
    if (!s.success) expect(s.error.issues[0].message).toMatch(/at least 3 characters/i);
  });

  it('rejects short message', () => {
    const s = ticketSchema.safeParse({ ...validTicket, message: 'Too short' });
    expect(s.success).toBe(false);
    if (!s.success) expect(s.error.issues[0].message).toMatch(/min 10 chars/i);
  });

  it('accepts valid priority', () => {
    const s = ticketSchema.safeParse({ ...validTicket, priority: 'HIGH' });
    expect(s.success).toBe(true);
  });

  it('rejects invalid priority', () => {
    const s = ticketSchema.safeParse({ ...validTicket, priority: 'URGENT' });
    expect(s.success).toBe(false);
  });
});

describe('replySchema', () => {
  it('accepts valid reply', () => {
    const s = replySchema.safeParse({ ticketId: 'abc123', message: 'Thank you' });
    expect(s.success).toBe(true);
  });

  it('rejects empty message', () => {
    const s = replySchema.safeParse({ ticketId: 'abc123', message: '' });
    expect(s.success).toBe(false);
    if (!s.success) expect(s.error.issues[0].message).toMatch(/cannot be empty/i);
  });

  it('rejects missing ticketId', () => {
    const s = replySchema.safeParse({ message: 'Some reply' });
    expect(s.success).toBe(false);
  });
});