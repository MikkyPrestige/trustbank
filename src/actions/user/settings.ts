'use server';

import { getAuthenticatedUser } from "@/lib/auth/user-guard";
import { db } from "@/lib/db";
import { checkMaintenanceMode, hashPin } from "@/lib/security";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { UserStatus } from "@prisma/client";

// --- SCHEMAS ---
const profileSchema = z.object({
    fullName: z.string().min(2, "Name is required").optional(),
    occupation: z.string().optional(),
    gender: z.string().optional(),
    dateOfBirth: z.string().optional(),
    phone: z.string().optional(),
    taxId: z.string().optional(),

    // Address
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    zipCode: z.string().optional(),

    // Next of Kin
    nokName: z.string().optional(),
    nokPhone: z.string().optional(),
    nokRelationship: z.string().optional(),
    nokEmail: z.string().email("Invalid email").optional().or(z.literal("")),
    nokAddress: z.string().optional(),

    // URLs
    image: z.string().optional(),
    passportUrl: z.string().optional(),
    idCardUrl: z.string().optional(),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password required"),
    newPassword: z.string().min(6, "New password must be 6+ chars"),
});

const pinSchema = z.object({
    currentPassword: z.string().min(1, "Password required for authorization"),
    newPin: z.string().length(4, "PIN must be exactly 4 digits"),
});

// --- 1. UPDATE PROFILE ---
export async function updateProfile(prevState: any, formData: FormData) {
      const { success, message, user } = await getAuthenticatedUser();

      if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }

   if (!success || !user) {
        return { success: false, message };
    }

    const rawData = Object.fromEntries(formData.entries());
    const validated = profileSchema.safeParse(rawData);

    if (!validated.success) {
        return { message: "Invalid inputs. Please check your data." };
    }

    const { dateOfBirth, ...otherData } = validated.data;

    try {
        // 1. CRITICAL DB WRITE
        await db.user.update({
            where: { id: user.id },
            data: {
                ...otherData,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined
            }
        });

        // 2. NOTIFY ADMINS
        try {
            const admins = await db.user.findMany({
                where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
                select: { id: true }
            });

            if (admins.length > 0) {
                await db.notification.createMany({
                    data: admins.map((admin) => ({
                        userId: admin.id,
                        title: "User Profile Updated",
                        message: `User ${user.fullName || 'Client'} updated their profile details.`,
                        type: "INFO",
                        link: `/admin/users/${user.id}`,
                        isRead: false
                    }))
                });
            }
        } catch (notifErr) {
            console.error("Admin Notification Failed:", notifErr);
        }

    } catch (err) {
        console.error("Profile Update Error:", err);
        return { message: "Update failed." };
    }

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
    return { success: true, message: "Profile Updated Successfully!" };
}

// --- 2. CHANGE PASSWORD ---
export async function changePassword(prevState: any, formData: FormData) {
     const { success, message, user } = await getAuthenticatedUser();

     if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }

   if (!success || !user) {
        return { success: false, message };
    }

    const rawData = Object.fromEntries(formData.entries());
    const validated = passwordSchema.safeParse(rawData);

    if (!validated.success) return { message: validated.error.issues[0].message };
    const { currentPassword, newPassword } = validated.data;

    try {
       if (!user.passwordHash) return { message: "User has no password set." };
        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) return { message: "Incorrect Current Password" };

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 1. Update Password
        await db.user.update({
            where: { id: user.id },
            data: { passwordHash: hashedPassword }
        });

        // 2. Security Notification
        await db.notification.create({
            data: {
                userId: user.id,
                title: "Security Alert",
                message: "Your password was changed successfully.",
                type: "WARNING",
                link: "/dashboard/settings",
                isRead: false
            }
        });

    } catch (err) {
        return { message: "Failed to change password." };
    }

    revalidatePath("/dashboard/settings");
    return { success: true, message: "Password Changed Successfully!" };
}

// --- 3. CHANGE PIN  ---
export async function changePin(prevState: any, formData: FormData) {
    const { success, message, user } = await getAuthenticatedUser();

    // 1. Maintenance Check
    if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }

    if (!success || !user) {
        return { success: false, message };
    }

    const rawData = Object.fromEntries(formData.entries());
    const validated = pinSchema.safeParse(rawData);

    if (!validated.success) return { message: validated.error.issues[0].message };
    const { currentPassword, newPin } = validated.data;

    try {
        if (!user.passwordHash) return { message: "User has no password set." };

        // 2. Verify Password  before changing PIN
        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) return { message: "Incorrect Password. Cannot update PIN." };

        // 3. HASH THE NEW PIN
        const securePin = await hashPin(newPin);

        // 4. Update DB
        await db.user.update({
            where: { id: user.id },
            data: {
                transactionPin: securePin,
                failedPinAttempts: 0,
                pinLockedUntil: null
            }
        });

        // 5. Security Notification
        await db.notification.create({
            data: {
                userId: user.id,
                title: "Security Alert",
                message: "Your Transaction PIN was updated successfully.",
                type: "WARNING",
                link: "/dashboard/settings",
                isRead: false
            }
        });

    } catch (err) {
        console.error("Change PIN Error:", err);
        return { message: "Failed to update PIN." };
    }

    revalidatePath("/dashboard/settings");
    return { success: true, message: "Transaction PIN Updated!" };
}

// --- 4. CHANGE CURRENCY ---
export async function updateUserCurrency(currencyCode: string) {
    const { success, message, user } = await getAuthenticatedUser();

    // 1. Maintenance Check
    if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }

    if (!success || !user) {
        return { success: false, message };
    }

    try {
        await db.user.update({
            where: { id: user.id },
            data: { currency: currencyCode }
        });

        revalidatePath("/dashboard");
        return { success: true, message: `Currency changed to ${currencyCode}` };
    } catch (error) {
        return { success: false, message: "Failed to update settings" };
    }
}


// --- 5. CLOSE ACCOUNT  ---
export async function closeAccount(password: string) {
    const { success, message, user } = await getAuthenticatedUser();

    // 1. Maintenance Check
    if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }

    if (!success || !user) {
        return { success: false, message };
    }

    if (!password) {
        return { error: "Password is required to confirm this action." };
    }

    try {
        const dbUser = await db.user.findUnique({
            where: { id: user.id },
            include: { accounts: true }
        });

        if (!dbUser) {
            return { error: "User record not found." };
        }

        // 3. Security Check: Verify Password
        const passwordMatch = await bcrypt.compare(password, dbUser.passwordHash);
        if (!passwordMatch) {
            return { error: "Incorrect password. Cannot verify account ownership." };
        }

        // 4. Financial Logic: Validate Zero Balance
        const totalBalance = dbUser.accounts.reduce((sum, acc) => sum + Number(acc.availableBalance), 0);

        // Formatter for clear error messages
        const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

        if (totalBalance > 0) {
            return {
                error: `Cannot close account: You still have ${formatter.format(totalBalance)} remaining. Please withdraw all funds first.`
            };
        }

        if (totalBalance < 0) {
            return {
                error: `Cannot close account: You have an outstanding balance of ${formatter.format(totalBalance)}. Please settle your debt first.`
            };
        }

        // 5. Execution: Archive User (Soft Delete)
        const archivedEmail = `deleted-${Date.now()}_${dbUser.email}`;

        await db.user.update({
            where: { id: user.id },
            data: {
                status: UserStatus.ARCHIVED,
                email: archivedEmail,
                emailVerified: null,
            }
        });

        // 6. Cleanup
        revalidatePath("/");
        return { success: true };

    } catch (error) {
        console.error("Close Account Error:", error);
        return { error: "System error. Please contact support." };
    }
}