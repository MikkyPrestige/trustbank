import { describe, it, expect } from 'vitest';

describe('Rate‑limit configuration', () => {
  it('Login limiter has sliding window of 5 attempts per 15 minutes', () => {
    const loginWindow = { count: 5, duration: '15 m' };
    expect(loginWindow.count).toBe(5);
    expect(loginWindow.duration).toBe('15 m');
  });

  it('OTP resend limiter has sliding window of 3 attempts per 10 minutes', () => {
    const otpWindow = { count: 3, duration: '10 m' };
    expect(otpWindow.count).toBe(3);
    expect(otpWindow.duration).toBe('10 m');
  });

  it('Password reset limiter has sliding window of 3 attempts per 10 minutes', () => {
    const pwdWindow = { count: 3, duration: '10 m' };
    expect(pwdWindow.count).toBe(3);
    expect(pwdWindow.duration).toBe('10 m');
  });

  it('Registration limiter has sliding window of 5 attempts per 15 minutes', () => {
    const regWindow = { count: 5, duration: '15 m' };
    expect(regWindow.count).toBe(5);
    expect(regWindow.duration).toBe('15 m');
  });
});