'use server';

import { db } from "@/lib/db";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { revalidatePath } from "next/cache";
import { UserStatus } from "@prisma/client";

// ♻️ RESTORE USER
export async function restoreUser(userId: string) {
       const auth = await checkAdminAction();

        if (!auth.authorized || !auth.session || !auth.session.user) {
            return { success: false, message: auth.message || "Unauthorized" };
        }

    try {
        // Restore to ACTIVE status
       const user = await db.user.findUnique({
            where: { id: userId },
            select: { email: true }
        });

        if (!user) return { success: false, message: "User not found." };

        // 2. Clean the email
        let cleanEmail = user.email;
        if (cleanEmail.startsWith("deleted-")) {
            const parts = cleanEmail.split('_');
            if (parts.length > 1) {
                cleanEmail = parts.slice(1).join('_');
            }
        }

        // 3. Check if the original email is taken
        const conflict = await db.user.findUnique({
            where: { email: cleanEmail }
        });

        if (conflict) {
            return {
                success: false,
                message: `Cannot restore. The email ${cleanEmail} is already in use by another active user.`
            };
        }

        // 4. Restore Status AND Email
        await db.user.update({
            where: { id: userId },
            data: {
                status: UserStatus.ACTIVE,
                email: cleanEmail
            }
        });

        revalidatePath("/admin/users");
        return { success: true, message: "User restored successfully." };

    } catch (error) {
        console.error("Restore Error:", error);
        return { success: false, message: "Failed to restore user." };
    }
}

// 💥 PERMANENT DELETE
export async function deleteUserPermanently(userId: string) {
       const auth = await checkAdminAction();

        if (!auth.authorized || !auth.session || !auth.session.user) {
            return { success: false, message: auth.message || "Unauthorized" };
        }

    try {

        await db.user.delete({
            where: { id: userId }
        });

        revalidatePath("/admin/users");
        return { success: true, message: "User permanently deleted." };
    } catch (error) {
        console.error("Delete Error:", error);
        return { success: false, message: "Failed. Ensure user has no active transaction dependencies." };
    }
}