import { describe, it, expect } from 'vitest';

function calculateWireFee(amount: number): number {
    if (amount <= 5000) return 25.00;
    if (amount <= 50000) return 50.00;
    return 100.00;
}

describe('calculateWireFee', () => {
  it('charges $25 for amounts up to 5000', () => {
    expect(calculateWireFee(100)).toBe(25);
    expect(calculateWireFee(5000)).toBe(25);
  });

  it('charges $50 for amounts between 5001 and 50000', () => {
    expect(calculateWireFee(5001)).toBe(50);
    expect(calculateWireFee(50000)).toBe(50);
  });

  it('charges $100 for amounts above 50000', () => {
    expect(calculateWireFee(50001)).toBe(100);
    expect(calculateWireFee(100000)).toBe(100);
  });
});