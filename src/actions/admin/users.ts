'use server';

import { db } from "@/lib/db";
import { logAdminAction } from "@/lib/admin-logger";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { UserStatus } from "@prisma/client";
import { checkAdminAction } from "@/lib/admin-auth";
import { z } from "zod";

// SCHEMA FOR PASSWORD RESET
const resetSchema = z.object({
    userId: z.string(),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

// 1. CREATE USER (Clients)
export async function adminCreateUser(formData: FormData) {
    const { authorized } = await checkAdminAction();
    if (!authorized) return { success: false, message: "Unauthorized" };

    const email = formData.get("email") as string;
    const fullName = formData.get("fullName") as string;
    const password = formData.get("password") as string;

    // Optional Fields
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const country = formData.get("country") as string;
    const zipCode = formData.get("zipCode") as string;
    const occupation = formData.get("occupation") as string;

    if (!email || !password || !fullName) {
        return { success: false, message: "Missing required fields" };
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return { success: false, message: "Email already in use." };

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate two different account numbers
        const checkingNum = "10" + Math.floor(Math.random() * 100000000).toString();
        const savingsNum = "20" + Math.floor(Math.random() * 100000000).toString();

        await db.user.create({
            data: {
                email,
                fullName,
                passwordHash: hashedPassword,
                role: "CLIENT",
                status: "ACTIVE",
                transactionPin: "0000",
                phone: phone || undefined,
                address: address || undefined,
                city: city || undefined,
                country: country || undefined,
                zipCode: zipCode || undefined,
                occupation: occupation || undefined,

                // 👇 FIX: Create BOTH Checking and Savings
                accounts: {
                    create: [
                        {
                            accountName: `${fullName} - Checking`,
                            type: "CHECKING",
                            accountNumber: checkingNum,
                            availableBalance: 0,
                            currentBalance: 0,
                            currency: "USD",
                            status: "ACTIVE",
                            isPrimary: true // Make checking primary
                        },
                        {
                            accountName: `${fullName} - Savings`,
                            type: "SAVINGS",
                            accountNumber: savingsNum,
                            availableBalance: 0,
                            currentBalance: 0,
                            currency: "USD",
                            status: "ACTIVE",
                            isPrimary: false
                        }
                    ]
                }
            }
        });

        await logAdminAction("CREATE_USER", "NEW_USER", { email });
        revalidatePath("/admin/users");
        return { success: true, message: "User created with Checking & Savings accounts." };

    } catch (err) {
        console.error("Create User Error:", err);
        return { success: false, message: "Database error. Failed to create user." };
    }
}

// 2. TOGGLE FREEZE STATUS
export async function toggleUserStatus(userId: string, newStatus: string) {
    const { authorized } = await checkAdminAction();
    if (!authorized) return { success: false, message: "Unauthorized" };

    try {
        // Prevent modifying Super Admins
        const targetUser = await db.user.findUnique({ where: { id: userId } });
        if (targetUser?.role === 'SUPER_ADMIN') {
            return { success: false, message: "Cannot modify Super Admin status." };
        }

        // 1. Update User Status
        await db.user.update({
            where: { id: userId },
            data: { status: newStatus as any }
        });

        // 👇 2. MIRROR LOGIC: If User is Frozen/Suspended, Freeze their Cards too
        if (newStatus === 'FROZEN' || newStatus === 'SUSPENDED') {
            await db.card.updateMany({
                where: { userId: userId },
                data: { status: 'FROZEN' }
            });
        }

        await logAdminAction("UPDATE_STATUS", userId, { status: newStatus, note: "Cards mirrored" });

        // Revalidate both Admin list and the User's dashboard so they see the change immediately
        revalidatePath("/admin/users");
        revalidatePath(`/admin/users/${userId}`);

        return { success: true, message: `User status updated to ${newStatus}. Cards synced.` };

    } catch (err) {
        console.error("Status Update Error:", err);
        return { success: false, message: "Failed to update status." };
    }
}


// 3. DELETE USER
export async function deleteUser(userId: string) {
    const { authorized } = await checkAdminAction();
    if (!authorized) return;

    // 👇 SAFETY GUARD: Prevent deleting a Super Admin
    const targetUser = await db.user.findUnique({ where: { id: userId } });
    if (targetUser?.role === 'SUPER_ADMIN') {
        console.error("Attempt to delete Super Admin blocked.");
        return;
    }

    await db.user.delete({ where: { id: userId } });
    await logAdminAction("DELETE_USER", "DELETED_USER", { originalId: userId });
    revalidatePath("/admin/users");
}


// 4. ISSUE VISA CARD
export async function adminIssueCard(userId: string) {
    const { authorized } = await checkAdminAction();
    if (!authorized) return { message: "Unauthorized" };

    try {
        const cardNumber = "4" + Math.floor(Math.random() * 1000000000000000).toString().padStart(15, '0');
        const cvv = Math.floor(100 + Math.random() * 900).toString();

        const date = new Date();
        date.setFullYear(date.getFullYear() + 3);
        const expiryDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getFullYear()).slice(-2)}`;

        await db.card.create({
            data: {
                userId,
                type: "VISA",
                cardNumber,
                cvv,
                expiryDate,
                status: "ACTIVE",
                isPhysical: false
            }
        });

        await logAdminAction("ISSUE_CARD", userId, { type: "VISA" });
        revalidatePath("/admin/users");
        return { success: true, message: "New Card Issued" };
    } catch (err) {
        return { message: "Failed to issue card" };
    }
}

// 5. RESET PASSWORD
export async function adminResetPassword(prevState: any, formData: FormData) {
    const { authorized } = await checkAdminAction();
    if (!authorized) return { success: false, message: "Unauthorized: Admins only." };

    const rawData = Object.fromEntries(formData.entries());
    const validated = resetSchema.safeParse(rawData);

    if (!validated.success) {
        return { success: false, message: "Invalid input." };
    }

    const { userId, newPassword } = validated.data;

    // Safety: Prevent resetting Super Admin password via this tool
    const target = await db.user.findUnique({ where: { id: userId } });
    if (target?.role === 'SUPER_ADMIN') {
         return { success: false, message: "Cannot reset Super Admin password here." };
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.user.update({
            where: { id: userId },
            data: {
                passwordHash: hashedPassword,
                failedPinAttempts: 0,
                pinLockedUntil: null
            }
        });

        await logAdminAction("RESET_PASSWORD", userId, { method: "Admin Console" });
        revalidatePath("/admin/users");
        return { success: true, message: "Password reset successfully." };
    } catch (error) {
        console.error("Admin Reset Error:", error);
        return { success: false, message: "Database update failed." };
    }
}