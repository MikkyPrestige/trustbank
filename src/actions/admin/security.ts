'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/auth/admin-auth";

export async function revokeUserSessions(userId: string) {
        const { authorized, session } = await checkAdminAction();

    if (!authorized || !session || !session.user || !session.user.email) {
        return { success: false, message: "Unauthorized access" };
    }

    try {
        // 1. Increment the version number
        await db.user.update({
            where: { id: userId },
            data: {
                tokenVersion: { increment: 1 }
            }
        });

        // 2. Clear cache
        revalidatePath("/admin/users");

        return { success: true, message: "All active sessions revoked. User signed out." };
    } catch (error) {
        console.error("Revoke Failed:", error);
        return { success: false, message: "Failed to revoke session." };
    }
}