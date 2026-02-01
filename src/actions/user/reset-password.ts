'use server';

import { db } from "@/lib/db";
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

    // 1. Validation
    if (!password || password.length < 6) {
        return { message: "Password must be at least 6 characters." };
    }
    if (password !== confirm) {
        return { message: "Passwords do not match." };
    }

    // 2. Find User with Valid Token
    const user = await db.user.findFirst({
        where: {
            passwordResetToken: token,
            passwordResetExpires: { gt: new Date() }
        }
    });

    if (!user) {
        return { message: "This reset link is invalid or has expired." };
    }

    // 3. Hash New Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Update Database
    await db.user.update({
        where: { id: user.id },
        data: {
            passwordHash: hashedPassword,
            passwordResetToken: null,
            passwordResetExpires: null
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
                link: "/settings/security",
                isRead: false
            }
        });
    } catch (error) {
        console.error("Failed to send password reset notification:", error);
    }

    return { success: true, message: "Password updated successfully." };
}