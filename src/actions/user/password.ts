'use server';

import { db } from "@/lib/db";
import { checkMaintenanceMode } from "@/lib/security";
import { getSiteSettings } from "@/lib/content/get-settings";
import { sendPasswordResetEmail } from "@/lib/mail";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";

export type ResetState = {
    message?: string;
    success?: boolean;
};

export async function resetPassword(
    token: string,
    prevState: ResetState,
    formData: FormData
): Promise<ResetState> {
    const password = formData.get("password") as string;
    const confirm = formData.get("confirmPassword") as string;

       if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }

    if (!password || password.length < 6) {
        return { message: "Password must be at least 6 characters." };
    }
    if (password !== confirm) {
        return { message: "Passwords do not match." };
    }

    const user = await db.user.findFirst({
        where: {
            passwordResetToken: token,
            passwordResetExpires: { gt: new Date() }
        }
    });

    if (!user) {
        return { message: "This reset link is invalid or has expired." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.update({
        where: { id: user.id },
        data: {
            passwordHash: hashedPassword,
            passwordResetToken: null,
            passwordResetExpires: null,
            tokenVersion: { increment: 1 }
        }
    });

    try {
        const headersList = await headers();
        const userAgent = headersList.get("user-agent") || "";
        const parser = new UAParser(userAgent);
        const result = parser.getResult();
        const device = `${result.browser.name || 'Web'} on ${result.os.name || 'Unknown OS'}`;

        await db.notification.create({
            data: {
                userId: user.id,
                title: "Security Alert: Password Changed",
                message: `Your account password was successfully reset from ${device}. If you did not perform this action, please contact support immediately.`,
                type: "CRITICAL",
                link: "dashboard/settings",
                isRead: false
            }
        });
    } catch (error) {
        console.error("Failed to send password reset notification:", error);
    }

    return { success: true, message: "Password updated successfully." };
}



export async function requestPasswordReset(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const settings = await getSiteSettings();
  const siteName = settings.site_name;

     if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }

  if (!email || !email.includes("@")) {
    return { message: "Please enter a valid email address." };
  }

  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    return { success: true, message: "If an account exists, a reset link has been sent." };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 3600000);

  await db.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: token,
      passwordResetExpires: expires
    }
  });

  await sendPasswordResetEmail(user.email, token, siteName);

  return { success: true, message: "Check your email for the reset link." };
}