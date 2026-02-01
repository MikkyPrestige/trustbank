'use server';

import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mail";
import { getSiteSettings } from "@/lib/content/get-settings";

export async function resendOtp(email: string) {
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

        // 2. Update DB
        await db.user.update({
            where: { id: user.id },
            data: { otpCode, otpExpires }
        });

        // 3. Send Email
        const settings = await getSiteSettings();
        const siteName = settings.site_name || "Trust Capital";

        await sendVerificationEmail(email, otpCode, siteName);

        return { success: true, message: "New verification code sent." };

    } catch (error) {
        console.error("Resend OTP Error:", error);
        return { error: "Failed to send code. Please try again." };
    }
}