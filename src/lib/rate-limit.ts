import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Sliding window limiters
export const loginLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),   // 5 failed attempts per 15 min
  analytics: true,
  prefix: "ratelimit:login",
});

// Different limiters for different endpoints
export const otpResendLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "10 m"),   // 3 requests per 10 min
  analytics: true,
  prefix: "ratelimit:otp-resend",
});

export const passwordResetLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "10 m"),   // 3 requests per 10 min
  analytics: true,
  prefix: "ratelimit:pwd-reset",
});

export const registerLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),   // 5 registrations per 15 min
  analytics: true,
  prefix: "ratelimit:register",
});