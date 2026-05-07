'use server';

import { db } from "@/lib/db";
import { logAdminAction } from "@/lib/utils/admin-logger";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { UserRole, UserStatus } from "@prisma/client";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { canPerform } from "@/lib/auth/permissions";
import { z } from "zod";

const sanitize = (str: string) => str.replace(/<[^>]*>/g, '');

const staffCreateSchema = z.object({
  email: z.string().email("Invalid email address").max(100),
  fullName: z.string().min(2, "Name is required").max(100),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.nativeEnum(UserRole).refine(val => val !== UserRole.SUPER_ADMIN, {
    message: "Cannot create Super Admin via web portal."
  }),
});

const promoteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.nativeEnum(UserRole).refine(val => val !== UserRole.SUPER_ADMIN, {
    message: "Cannot promote to Super Admin via web portal."
  }),
});

export async function createStaffAccount(formData: FormData) {
    const { authorized, session } = await checkAdminAction();

    if (!authorized || !session || !session.user) {
        return { success: false, message: "Unauthorized." };
    }

    if (!canPerform(session.user.role as UserRole, 'ADMIN_MGMT')) {
        return { success: false, message: "Unauthorized: Super Admin access required." };
    }

    const rawData = {
  email: formData.get("email") as string,
  fullName: formData.get("fullName") as string,
  password: formData.get("password") as string,
  role: formData.get("role") as string,
};

const validated = staffCreateSchema.safeParse(rawData);
if (!validated.success) {
  return { success: false, message: validated.error.issues[0].message };
}

const { email, fullName: rawFullName, password, role } = validated.data;
const fullName = sanitize(rawFullName);

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
                transactionPin: Math.floor(1000 + Math.random() * 9000).toString(),
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

    if (staffId === session.user.id) {
  return { success: false, message: "You cannot revoke your own privileges." };
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

const rawData = {
  email: formData.get("email") as string,
  role: formData.get("role") as string,
};

const validated = promoteSchema.safeParse(rawData);
if (!validated.success) {
  return { success: false, message: validated.error.issues[0].message };
}

const { email, role } = validated.data;

    const user = await db.user.findUnique({ where: { email } });
    if (!user) return { success: false, message: "User not found." };

    if (user.role === UserRole.SUPER_ADMIN) return { success: false, message: "Cannot modify Super Admin." };
    if (user.role === role) return { success: false, message: `User is already a ${role}.` };

    if (session.user.email === email) {
  return { success: false, message: "You cannot modify your own role." };
}

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