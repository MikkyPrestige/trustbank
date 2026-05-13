import { describe, it, expect } from 'vitest';

// A standalone sanitize function identical to the one used across actions
const sanitize = (str: string) => str.replace(/<[^>]*>/g, '');

describe('sanitize helper', () => {
  it('removes simple HTML tags', () => {
    const input = '<script>alert("xss")</script>';
    expect(sanitize(input)).toBe('alert("xss")');
  });

  it('removes nested tags', () => {
    const input = '<div><p>hello</p></div>';
    expect(sanitize(input)).toBe('hello');
  });

  it('preserves text without tags', () => {
    const input = 'Normal text';
    expect(sanitize(input)).toBe('Normal text');
  });

  it('handles empty string', () => {
    expect(sanitize('')).toBe('');
  });
});