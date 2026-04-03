'use server';

import { db } from "@/lib/db";
import { logAdminAction } from "@/lib/utils/admin-logger";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { UserRole, UserStatus } from "@prisma/client";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { canPerform } from "@/lib/auth/permissions";

export async function createStaffAccount(formData: FormData) {
    const { authorized, session } = await checkAdminAction();

    if (!authorized || !session || !session.user) {
        return { success: false, message: "Unauthorized." };
    }

    if (!canPerform(session.user.role as UserRole, 'ADMIN_MGMT')) {
        return { success: false, message: "Unauthorized: Super Admin access required." };
    }

    const email = formData.get("email") as string;
    const fullName = formData.get("fullName") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as UserRole;

    if (!email || !password || !role) return { success: false, message: "Missing fields" };

    if (role === UserRole.SUPER_ADMIN) {
        return { success: false, message: "Cannot create Super Admin via web portal." };
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return { success: false, message: "Email already in use." };

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await db.user.create({
            data: {
                email,
                fullName,
                passwordHash: hashedPassword,
                role: role,
                status: UserStatus.ACTIVE,
                transactionPin: "0000",
            }
        });

        await db.notification.create({
            data: {
                userId: newUser.id,
                title: "Welcome to the Team",
                message: `Your account has been created with ${role} privileges.`,
                type: "INFO",
                link: "/admin",
                isRead: false
            }
        });

        await logAdminAction(
            "CREATE_STAFF",
            newUser.id,
            { role, email, admin: session.user.email },
            "INFO",
            "SUCCESS"
        );

    } catch (err) {
        console.error(err);
        return { success: false, message: "Failed to create staff account." };
    }

    revalidatePath("/admin/staff");
    return { success: true, message: `${role} account created successfully.` };
}

export async function removeStaffAccount(staffId: string) {
    const { authorized, session } = await checkAdminAction();

    if (!authorized || !session || !session.user) {
        return { success: false, message: "Unauthorized" };
    }

    if (!canPerform(session.user.role as UserRole, 'ADMIN_MGMT')) {
        return { success: false, message: "Unauthorized: Super Admin access required." };
    }

    try {
        const target = await db.user.findUnique({ where: { id: staffId } });

        if (!target || target.role === UserRole.SUPER_ADMIN) {
            return { success: false, message: "Cannot remove this user." };
        }

        await db.user.update({
            where: { id: staffId },
            data: { role: UserRole.CLIENT }
        });

        await db.notification.create({
            data: {
                userId: staffId,
                title: "Access Revoked",
                message: "Your administrative privileges have been revoked. You are now a Standard Client.",
                type: "ERROR",
                link: "/dashboard",
                isRead: false
            }
        });

        await logAdminAction(
            "REVOKE_STAFF",
            staffId,
            {
                email: target.email,
                previousRole: target.role,
                admin: session.user.email
            },
            "WARNING",
            "SUCCESS"
        );

    } catch (err) {
        console.error("Remove Staff Error:", err);
        return { success: false, message: "Failed to remove staff privileges." };
    }

    revalidatePath("/admin/staff");
    return { success: true, message: "Staff access revoked. User is now a Client." };
}

export async function promoteUserToStaff(formData: FormData) {
    const { authorized, session } = await checkAdminAction();

    if (!authorized || !session || !session.user) {
        return { success: false, message: "Unauthorized." };
    }

    if (!canPerform(session.user.role as UserRole, 'ADMIN_MGMT')) {
        return { success: false, message: "Unauthorized: Super Admin access required." };
    }

    const email = formData.get("email") as string;
    const role = formData.get("role") as UserRole;

    if (!email || !role) return { success: false, message: "Missing email or role." };

    if (role === UserRole.SUPER_ADMIN) {
        return { success: false, message: "Cannot promote to Super Admin via web portal." };
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) return { success: false, message: "User not found." };

    if (user.role === UserRole.SUPER_ADMIN) return { success: false, message: "Cannot modify Super Admin." };
    if (user.role === role) return { success: false, message: `User is already a ${role}.` };

    try {
        await db.user.update({
            where: { email },
            data: { role: role }
        });

        await db.notification.create({
            data: {
                userId: user.id,
                title: "Role Updated",
                message: `You have been promoted to ${role}. Access the admin dashboard to continue.`,
                type: "SUCCESS",
                link: "/admin",
                isRead: false
            }
        });

        await logAdminAction(
            "PROMOTE_STAFF",
            user.id,
            {
                oldRole: user.role,
                newRole: role,
                admin: session.user.email
            },
            "WARNING",
            "SUCCESS"
        );

    } catch (err) {
        return { success: false, message: "Database update failed." };
    }

    revalidatePath("/admin/staff");
    return { success: true, message: `User promoted to ${role} successfully.` };
}