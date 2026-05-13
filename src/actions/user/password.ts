'use server';

import { db } from "@/lib/db";
import { headers } from "next/headers";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { UAParser } from "ua-parser-js";
import { z } from "zod";
import { logAdminAction } from "@/lib/utils/admin-logger";
import { checkMaintenanceMode } from "@/lib/security";
import { getSiteSettings } from "@/lib/content/get-settings";
import { sendPasswordResetEmail } from "@/lib/mail";
import { passwordResetLimiter } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/utils/security-logger";

const sanitize = (str: string) => str.replace(/<[^>]*>/g, '');

export type ResetState = {
    message?: string;
    success?: boolean;
};

const passwordChangesSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const emailSchema = z.string().email("Please enter a valid email address");

export async function resetPassword(
    token: string,
    prevState: ResetState,
    formData: FormData
): Promise<ResetState> {

       if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }

const headersList = await headers();
const ip = headersList.get("x-forwarded-for") || "Unknown IP";
const safeIp = sanitize(ip);
const userAgent = headersList.get("user-agent") || "";
const parser = new UAParser(userAgent);
const result = parser.getResult();
const device = sanitize(`${result.browser.name || 'Web'} on ${result.os.name || 'Unknown OS'}`);

  const rawData = {
  password: formData.get("password") as string,
  confirmPassword: formData.get("confirmPassword") as string,
};

const validated = passwordChangesSchema.safeParse(rawData);
if (!validated.success) {
  return { message: validated.error.issues[0].message };
}
const { password } = validated.data;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await db.user.findFirst({
        where: {
            passwordResetToken: hashedToken,
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

    await logSecurityEvent({
  action: "PASSWORD_RESET_SUCCESS",
  level: "WARNING",
  details: { userId: user.id, email: user.email },
  ipAddress: safeIp,
  userAgent,
  userId: user.id,
});

    try {
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
  const settings = await getSiteSettings();
  const siteName = settings.site_name;

     if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }

 const email = formData.get("email") as string;
const emailValidation = emailSchema.safeParse(email);
if (!emailValidation.success) {
  return { message: "Please enter a valid email address." };
}
const safeEmail = emailValidation.data;

const genericMessage = { success: true, message: "If an account with that email exists, a reset link has been sent." };

// Redis‑based rate limiting
const headersList = await headers();
const ip = headersList.get("x-forwarded-for") || "Unknown IP";

const { success: allowed, reset } = await passwordResetLimiter.limit(ip);
if (!allowed) {
    const retrySeconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
    const retryMinutes = Math.ceil(retrySeconds / 60);

        await logSecurityEvent({
        action: "PASSWORD_RESET_BLOCKED",
        level: "WARNING",
        details: { email: safeEmail, ip },
        ipAddress: ip,
    });

    return {
        success: false,
        message: `Too many requests. Please try again in ${retryMinutes} minute${retryMinutes !== 1 ? 's' : ''}.`
    };
}

// Log the attempt
await logAdminAction("RESET_PASSWORD_ATTEMPT", safeEmail, { ip }, "INFO", "ATTEMPT");

  const user = await db.user.findUnique({ where: { email: safeEmail } });

  if (!user) {
    return genericMessage;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const expires = new Date(Date.now() + 3600000);

  await db.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: hashedToken,
      passwordResetExpires: expires
    }
  });

  await sendPasswordResetEmail(safeEmail, token, siteName);

  return genericMessage;
}