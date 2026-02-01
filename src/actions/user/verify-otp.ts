"use server";

import { db } from "@/lib/db";

export async function verifyOtp(email: string, code: string) {
  const user = await db.user.findUnique({ where: { email } });

  if (!user || !user.otpCode || !user.otpExpires) {
    return { error: "Invalid request" };
  }

  // 1. Check if expired
  if (new Date() > user.otpExpires) {
    return { error: "Code has expired. Please request a new one." };
  }

  // 2. Check if code matches
  if (user.otpCode !== code) {
    return { error: "Invalid verification code." };
  }

  // 3. Success! clear code and mark verified
  await db.user.update({
    where: { email },
    data: {
      emailVerified: new Date(),
      otpCode: null,
      otpExpires: null,
      status: "ACTIVE" // Unlock the account
    }
  });

  return { success: true };
}