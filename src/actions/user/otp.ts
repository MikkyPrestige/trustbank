'use server';

import { db } from "@/lib/db";
import { headers } from "next/headers";
import { sendVerificationEmail } from "@/lib/mail";
import { checkMaintenanceMode, checkOtpResendLimit } from "@/lib/security";
import { logAdminAction } from "@/lib/utils/admin-logger";
import { getSiteSettings } from "@/lib/content/get-settings";
import { z } from "zod";

const emailSchema = z.string().email("Invalid email address").max(100);
const otpCodeSchema = z.string().regex(/^\d{6}$/, "Code must be a 6‑digit number");


export async function verifyOtp(email: string, code: string) {
     if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }

    const emailCheck = emailSchema.safeParse(email);
if (!emailCheck.success) {
  return { error: "Invalid request" };
}
const safeEmail = emailCheck.data;

const codeCheck = otpCodeSchema.safeParse(code);
if (!codeCheck.success) {
  return { error: "Invalid verification code." };
}
const safeCode = codeCheck.data;

  const user = await db.user.findUnique({ where: { email: safeEmail } });

  if (!user || !user.otpCode || !user.otpExpires) {
    return { error: "Invalid request" };
  }

  if (new Date() > user.otpExpires) {
    return { error: "Code has expired. Please request a new one." };
  }

  if (user.otpCode !== safeCode) {
    return { error: "Invalid verification code." };
  }

  await db.user.update({
    where: { email: safeEmail },
    data: {
      emailVerified: new Date(),
      otpCode: null,
      otpExpires: null,
      status: "ACTIVE"
    }
  });

  return { success: true, message: "Account activated!" };
}



export async function resendOtp(email: string) {
       if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }

   const emailCheck = emailSchema.safeParse(email);
if (!emailCheck.success) {
  return { error: "Email is required" };
}
const safeEmail = emailCheck.data;


// ---- IP‑based rate limiting ----
const headersList = await headers();
const ip = headersList.get("x-forwarded-for") || "Unknown IP";
const rateLimit = await checkOtpResendLimit(ip);

if (rateLimit.isBlocked) {
    return {
        error: "Too many requests. Please try again later."
    };
}

await logAdminAction("RESEND_OTP_ATTEMPT", safeEmail, { ip }, "INFO", "ATTEMPT");

    try {
        const user = await db.user.findUnique({ where: { email: safeEmail } });

        if (!user) {
            return { success: true, message: "If an account with this email is not yet verified, a new code has been sent." };
        }

        if (user.emailVerified) {
           return { success: true, message: "If an account with this email is not yet verified, a new code has been sent." };
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        await db.user.update({
            where: { id: user.id },
            data: { otpCode, otpExpires }
        });

        const settings = await getSiteSettings();
        const siteName = settings.site_name;

        await sendVerificationEmail(safeEmail, otpCode, siteName);

        return { success: true, message: "If an account with this email is not yet verified, a new code has been sent." };

    } catch (error) {
        console.error("Resend OTP Error:", error);
        return { error: "Failed to send code. Please try again." };
    }
}