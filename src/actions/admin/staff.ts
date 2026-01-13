'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logAdminAction } from "@/lib/admin-logger";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

// 1. CREATE STAFF (Your existing code)
export async function createStaffAccount(formData: FormData) {
    const session = await auth();

    // 🔒 STRICT SECURITY CHECK
    if (session?.user?.role !== 'SUPER_ADMIN') {
        return { success: false, message: "Unauthorized: Super Admin access required." };
    }

    const email = formData.get("email") as string;
    const fullName = formData.get("fullName") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as UserRole;

    if (!email || !password || !role) return { success: false, message: "Missing fields" };

    if (role === 'SUPER_ADMIN') {
        return { success: false, message: "Cannot create Super Admin via web portal." };
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return { success: false, message: "Email already in use." };

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.user.create({
            data: {
                email,
                fullName,
                passwordHash: hashedPassword,
                role: role,
                status: "ACTIVE",
                transactionPin: "0000",
                // Staff don't need bank accounts
            }
        });

        await logAdminAction("CREATE_STAFF", "NEW_STAFF", { role, email });
        revalidatePath("/admin/staff");
        return { success: true, message: `${role} account created successfully.` };

    } catch (err) {
        console.error(err);
        return { success: false, message: "Failed to create staff account." };
    }
}

// 2. REMOVE STAFF (New)
export async function removeStaffAccount(staffId: string) {
    const session = await auth();

    // 🔒 STRICT SECURITY CHECK
    if (session?.user?.role !== 'SUPER_ADMIN') {
        return { success: false, message: "Unauthorized" };
    }

    try {
        const target = await db.user.findUnique({ where: { id: staffId } });

        // Safety: Don't let Super Admin modify themselves or other Super Admins
        if (!target || target.role === 'SUPER_ADMIN') {
            return { success: false, message: "Cannot remove this user." };
        }

        // Update role to CLIENT
        await db.user.update({
            where: { id: staffId },
            data: { role: 'CLIENT' }
        });

        await logAdminAction("REVOKE_STAFF", staffId, { email: target.email, previousRole: target.role });
        revalidatePath("/admin/staff");

        return { success: true, message: "Staff access revoked. User is now a Client." };

    } catch (err) {
        console.error("Remove Staff Error:", err);
        return { success: false, message: "Failed to remove staff privileges." };
    }
}


export async function promoteUserToStaff(formData: FormData) {
    const session = await auth();

    // 🔒 STRICT SECURITY CHECK
    if (session?.user?.role !== 'SUPER_ADMIN') {
        return { success: false, message: "Unauthorized." };
    }

    const email = formData.get("email") as string;
    const role = formData.get("role") as UserRole;

    if (!email || !role) return { success: false, message: "Missing email or role." };

    // 1. Find the user
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return { success: false, message: "User not found." };

    // 2. Safety Checks
    if (user.role === 'SUPER_ADMIN') return { success: false, message: "Cannot modify Super Admin." };
    if (user.role === role) return { success: false, message: `User is already a ${role}.` };

    try {
        // 3. Update Role
        await db.user.update({
            where: { email },
            data: { role: role }
        });

        await logAdminAction("PROMOTE_STAFF", user.id, { oldRole: user.role, newRole: role });
        revalidatePath("/admin/staff");
        return { success: true, message: `User promoted to ${role} successfully.` };

    } catch (err) {
        return { success: false, message: "Database update failed." };
    }
}