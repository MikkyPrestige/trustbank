'use server';

import { db } from "@/lib/db";
import { checkMaintenanceMode } from "@/lib/security";
import { sendVerificationEmail } from "@/lib/mail";
import { getSiteSettings } from "@/lib/content/get-settings";


export async function verifyOtp(email: string, code: string) {
     if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }

  const user = await db.user.findUnique({ where: { email } });

  if (!user || !user.otpCode || !user.otpExpires) {
    return { error: "Invalid request" };
  }

  if (new Date() > user.otpExpires) {
    return { error: "Code has expired. Please request a new one." };
  }

  if (user.otpCode !== code) {
    return { error: "Invalid verification code." };
  }

  await db.user.update({
    where: { email },
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

    if (!email) return { error: "Email is required" };

    try {
        const user = await db.user.findUnique({ where: { email } });

        if (!user) {
            return { success: true, message: "If account exists, code sent." };
        }

        if (user.emailVerified) {
            return { error: "This email is already verified. Please log in." };
        }

        // 1. Generate New Code
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        await db.user.update({
            where: { id: user.id },
            data: { otpCode, otpExpires }
        });

        // 3. Send Email
        const settings = await getSiteSettings();
        const siteName = settings.site_name;

        await sendVerificationEmail(email, otpCode, siteName);

        return { success: true, message: "New verification code sent." };

    } catch (error) {
        console.error("Resend OTP Error:", error);
        return { error: "Failed to send code. Please try again." };
    }
}