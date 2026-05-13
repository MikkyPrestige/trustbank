'use server';

import { db } from "@/lib/db";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { revalidatePath } from "next/cache";
import { UserStatus } from "@prisma/client";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { logSecurityEvent } from "@/lib/utils/security-logger";

const idSchema = z.string().min(1);

export async function restoreUser(userId: string) {
       const auth = await checkAdminAction();

        if (!auth.authorized || !auth.session || !auth.session.user) {
            return { success: false, message: auth.message || "Unauthorized" };
        }

        const validatedId = idSchema.safeParse(userId);
if (!validatedId.success) return { success: false, message: "Invalid user ID" };
const safeUserId = validatedId.data;

    try {
       const user = await db.user.findUnique({
            where: { id: safeUserId },
            select: { email: true, status: true }
        });

        if (!user) return { success: false, message: "User not found." };

        if (user.status !== UserStatus.ARCHIVED) {
    return { success: false, message: "Only archived users can be restored." };
}

        let cleanEmail = user.email;
        if (cleanEmail.startsWith("deleted-")) {
            const parts = cleanEmail.split('_');
            if (parts.length > 1) {
                cleanEmail = parts.slice(1).join('_');
            }
        }

        const conflict = await db.user.findUnique({
            where: { email: cleanEmail }
        });

        if (conflict) {
            return {
                success: false,
                message: `Cannot restore. The email ${cleanEmail} is already in use by another active user.`
            };
        }

        await db.user.update({
            where: { id: userId },
            data: {
                status: UserStatus.ACTIVE,
                email: cleanEmail
            }
        });

        await logSecurityEvent({
  action: "ADMIN_RESTORE_USER",
  level: "WARNING",
  details: {
    targetUserId: safeUserId,
    restoredEmail: cleanEmail,
    adminEmail: auth.session.user.email,
  },
  adminId: auth.session.user.id,
  userId: safeUserId,
});

        revalidatePath("/admin/users");
        return { success: true, message: "User restored successfully." };

    } catch (error) {
        console.error("Restore Error:", error);
        return { success: false, message: "Failed to restore user." };
    }
}


export async function deleteUserPermanently(userId: string) {
       const auth = await checkAdminAction();

        if (!auth.authorized || !auth.session || !auth.session.user) {
            return { success: false, message: auth.message || "Unauthorized" };
        }

        const validatedId = idSchema.safeParse(userId);
if (!validatedId.success) return { success: false, message: "Invalid user ID" };
const safeUserId = validatedId.data;

if (auth.session.user.id === safeUserId) {
    return { success: false, message: "You cannot permanently delete your own account." };
}

const target = await db.user.findUnique({
    where: { id: safeUserId },
    select: { id: true, status: true, role: true }
});

if (!target) return { success: false, message: "User not found." };
if (target.status !== UserStatus.ARCHIVED) {
    return { success: false, message: "Only archived users can be permanently deleted." };
}
if (target.role === UserRole.SUPER_ADMIN) {
    return { success: false, message: "Cannot delete a Super Admin." };
}

await db.user.delete({ where: { id: safeUserId } });

await logSecurityEvent({
  action: "ADMIN_PERMANENT_DELETE_USER",
  level: "CRITICAL",
  details: {
    targetUserId: safeUserId,
    adminEmail: auth.session.user.email,
  },
  adminId: auth.session.user.id,
  userId: safeUserId,
});
}