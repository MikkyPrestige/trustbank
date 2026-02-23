'use server';

import { auth } from "@/auth";
import { getAuthenticatedUser } from "@/lib/auth/user-guard";
import { db } from "@/lib/db";
import { checkMaintenanceMode, hashPin } from "@/lib/security";
import { uploadFileToCloud } from "@/lib/utils/upload";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { UserStatus } from "@prisma/client";

const profileSchema = z.object({
    fullName: z.string().min(2, "Name is required").optional(),
    occupation: z.string().optional(),
    gender: z.string().optional(),
    dateOfBirth: z.string().optional(),
    phone: z.string().optional(),
    taxId: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    zipCode: z.string().optional(),
    nokName: z.string().optional(),
    nokPhone: z.string().optional(),
    nokRelationship: z.string().optional(),
    nokEmail: z.string().email("Invalid email").optional().or(z.literal("")),
    nokAddress: z.string().optional(),
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


// --- 1. UPDATE AVATAR ---
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function updateAvatar(formData: FormData) {
   const { success, message, user } = await getAuthenticatedUser();

   if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }

   if (!success || !user) {
        return { success: false, message };
    }

   const file = formData.get("file") as File;
    if (!file || file.size === 0) return { success: false, message: "No file selected" };

    if (file.size > MAX_FILE_SIZE) {
        return { success: false, message: "File is too large. Max 10MB." };
    }

    let secureUrl = "";

    try {

        // Upload to Server
        secureUrl = await uploadFileToCloud(file, "avatars");

        await db.user.update({
            where: { id: user.id },
            data: { image: secureUrl }
        });

    } catch (error: any) {
        console.error("Avatar Update Error:", error);
        return { success: false, message: error.message || "Failed to upload profile picture." };
    }
    revalidatePath("/dashboard");

    return { success: true, message: "Profile picture updated!", url: secureUrl };
}

// --- 2. UPDATE PROFILE ---
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
        await db.user.update({
            where: { id: user.id },
            data: {
                ...otherData,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined
            }
        });

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

// --- 3. CHANGE PASSWORD ---
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

        await db.user.update({
            where: { id: user.id },
            data: {
                passwordHash: hashedPassword,
                tokenVersion: { increment: 1 }
            }
        });

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

// --- 4. CHANGE PIN  ---
export async function changePin(prevState: any, formData: FormData) {
    const { success, message, user } = await getAuthenticatedUser();

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

        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) return { message: "Incorrect Password. Cannot update PIN." };

        const securePin = await hashPin(newPin);

        await db.user.update({
            where: { id: user.id },
            data: {
                transactionPin: securePin,
                failedPinAttempts: 0,
                pinLockedUntil: null
            }
        });

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

// --- 5. CHANGE CURRENCY ---
export async function updateUserCurrency(currencyCode: string) {
    const { success, message, user } = await getAuthenticatedUser();

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


// --- 6. LOGOUT ALL DEVICES  ---
export async function logoutAllDevices() {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    try {
        await db.user.update({
            where: { id: session.user.id },
            data: {
                tokenVersion: { increment: 1 }
            }
        });

        revalidatePath('/dashboard/settings');
        return { success: true, message: "Successfully logged out of all other sessions." };
    } catch (error) {
        console.error("Global Logout Error:", error);
        return { error: "Failed to process request." };
    }
}


// --- 7. CLOSE ACCOUNT  ---
export async function closeAccount(password: string) {
  const { success, message, user } = await getAuthenticatedUser();

    if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }

    if (!success || !user) return { message };

    if (!password) {
        return { error: "Current password is required to close account." };
    }

    try {
        const dbUser = await db.user.findUnique({
            where: { id: user.id },
            include: { accounts: true }
        });

        if (!dbUser) {
            return { error: "User record not found." };
        }

        const passwordMatch = await bcrypt.compare(password, dbUser.passwordHash);
        if (!passwordMatch) {
            return { error: "Incorrect password. Cannot verify ownership." };
        }

        // Check Balances
        const totalBalance = dbUser.accounts.reduce((sum, acc) => sum + Number(acc.availableBalance), 0);

        const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

        if (totalBalance > 0) {
            return {
                error: `Action Failed: You still have ${formatter.format(totalBalance)} in your accounts. You must withdraw all funds to $0.00 before closing.`
            };
        }

        if (totalBalance < 0) {
            return {
                error: `Action Failed: Your account is in overdraft (${formatter.format(totalBalance)}). You must settle this debt before closing.`
            };
        }

        //  ARCHIVE USER (Soft Delete)
        const archivedEmail = `deleted-${Date.now()}_${dbUser.email}`;

        await db.user.update({
            where: { id: user.id },
            data: {
                status: UserStatus.ARCHIVED,
                email: archivedEmail,
                emailVerified: null,
            }
        });

        revalidatePath("/");
        return { success: true };

    } catch (error) {
        console.error("Close Account Error:", error);
        return { error: "System error. Please contact support if this persists." };
    }
}