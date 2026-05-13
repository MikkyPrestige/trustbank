import { describe, it, expect } from 'vitest';

function distributeAmount(total: number, parts: number): number[] {
    if (parts <= 1) return [Number(total.toFixed(2))];
    let remainder = total;
    const result = [];
    for (let i = 0; i < parts - 1; i++) {
        const max = (remainder / (parts - i)) * 1.5;
        const val = Math.floor(Math.random() * max) + 1;
        result.push(val);
        remainder -= val;
    }
    result.push(Number(remainder.toFixed(2)));
    return result;
}

describe('distributeAmount', () => {
  it('returns a single part equal to total', () => {
    const parts = distributeAmount(100, 1);
    expect(parts).toHaveLength(1);
    expect(parts[0]).toBe(100);
  });

  it('returns correct number of parts', () => {
    const parts = distributeAmount(100, 5);
    expect(parts).toHaveLength(5);
  });

  it('sum of parts equals total', () => {
    const total = 200;
    const parts = distributeAmount(total, 4);
    const sum = parts.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(total, 2);
  });

  it('returns zero parts when called with zero parts', () => {
    expect(distributeAmount(50, 0)).toHaveLength(1);
  });
});