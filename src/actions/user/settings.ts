'use server';

import { auth } from "@/auth";
import { getAuthenticatedUser } from "@/lib/auth/user-guard";
import { db } from "@/lib/db";
import { TIMEZONES } from "@/lib/constants/timezones";
import { checkMaintenanceMode, hashPin } from "@/lib/security";
import { uploadFileToCloud } from "@/lib/utils/upload";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { UserStatus } from "@prisma/client";
import { fileTypeFromBuffer } from 'file-type';
import { logSecurityEvent } from "@/lib/utils/security-logger";

const sanitize = (str: string) => str.replace(/<[^>]*>/g, '');

const profileSchema = z.object({
    fullName: z.string().min(2, "Name is required").max(100).optional(),
    occupation: z.string().max(100).optional(),
    gender: z.string().max(20).optional(),
    dateOfBirth: z.string().max(10).optional(),
    phone: z.string().max(30).optional(),
    taxId: z.string().max(50).optional(),
    address: z.string().max(200).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    country: z.string().max(100).optional(),
    zipCode: z.string().max(20).optional(),
    nokName: z.string().max(100).optional(),
    nokPhone: z.string().max(30).optional(),
    nokRelationship: z.string().max(50).optional(),
    nokEmail: z.string().email("Invalid email").max(100).optional().or(z.literal("")),
    nokAddress: z.string().max(200).optional(),
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

const MAX_FILE_SIZE = 10 * 1024 * 1024;

async function isValidImage(file: File): Promise<boolean> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await fileTypeFromBuffer(buffer);
  return result?.mime.startsWith('image/') ?? false;
}

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

    // Validate that the file is an actual image
const isImage = await isValidImage(file);
if (!isImage) {
    return { success: false, message: "Only image files are allowed." };
}

    let secureUrl = "";

    try {

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

    const rawUpdateData = validated.data;

    // Lock DOB and gender once KYC is verified — they must match the verified ID
    const isKycVerified = user.kycStatus === 'VERIFIED';

const safeData = {
  fullName: rawUpdateData.fullName ? sanitize(rawUpdateData.fullName) : undefined,
  occupation: rawUpdateData.occupation ? sanitize(rawUpdateData.occupation) : undefined,
  gender: (!isKycVerified && rawUpdateData.gender) ? sanitize(rawUpdateData.gender) : undefined,
  phone: rawUpdateData.phone ? sanitize(rawUpdateData.phone) : undefined,
  taxId: rawUpdateData.taxId ? sanitize(rawUpdateData.taxId) : undefined,
  address: rawUpdateData.address ? sanitize(rawUpdateData.address) : undefined,
  city: rawUpdateData.city ? sanitize(rawUpdateData.city) : undefined,
  state: rawUpdateData.state ? sanitize(rawUpdateData.state) : undefined,
  country: rawUpdateData.country ? sanitize(rawUpdateData.country) : undefined,
  zipCode: rawUpdateData.zipCode ? sanitize(rawUpdateData.zipCode) : undefined,
  nokName: rawUpdateData.nokName ? sanitize(rawUpdateData.nokName) : undefined,
  nokPhone: rawUpdateData.nokPhone ? sanitize(rawUpdateData.nokPhone) : undefined,
  nokRelationship: rawUpdateData.nokRelationship ? sanitize(rawUpdateData.nokRelationship) : undefined,
  nokEmail: rawUpdateData.nokEmail,
  nokAddress: rawUpdateData.nokAddress ? sanitize(rawUpdateData.nokAddress) : undefined,
  dateOfBirth: (!isKycVerified && rawUpdateData.dateOfBirth) ? new Date(rawUpdateData.dateOfBirth) : undefined,
};

    try {
        await db.user.update({
            where: { id: user.id },
            data: { ...safeData }
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
                        message: `User ${sanitize(user.fullName || 'Client')} updated their profile details.`,
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

    await logSecurityEvent({
  action: "USER_PASSWORD_CHANGE",
  level: "WARNING",
  userId: user.id,
});

    } catch (err) {
        return { message: "Failed to change password." };
    }

    revalidatePath("/dashboard/settings");
    return { success: true, message: "Password Changed Successfully!" };
}

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

        await logSecurityEvent({
  action: "USER_PIN_CHANGE",
  level: "WARNING",
  userId: user.id,
});

    } catch (err) {
        console.error("Change PIN Error:", err);
        return { message: "Failed to update PIN." };
    }

    revalidatePath("/dashboard/settings");
    return { success: true, message: "Transaction PIN Updated!" };
}

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

        const archivedEmail = `deleted-${Date.now()}_${dbUser.email}`;

        await db.user.update({
            where: { id: user.id },
            data: {
                status: UserStatus.ARCHIVED,
                email: archivedEmail,
                emailVerified: null,
            }
        });

        await logSecurityEvent({
  action: "USER_ACCOUNT_CLOSED",
  level: "CRITICAL",
  userId: user.id,
  details: {
    email: dbUser.email,
  },
});

        revalidatePath("/");
        return { success: true };

    } catch (error) {
        console.error("Close Account Error:", error);
        return { error: "System error. Please contact support if this persists." };
    }
}
export async function updateUserTimezone(timezone: string) {
    const session = await auth();
    if (!session?.user?.email) return { success: false, message: "Not authenticated." };

    const valid = TIMEZONES.some(t => t.value === timezone);
    if (!valid) return { success: false, message: "Invalid timezone." };

    try {
        await db.user.update({
            where: { email: session.user.email },
            data: { timezone }
        });
        revalidatePath("/dashboard/settings");
        return { success: true, message: "Timezone updated." };
    } catch {
        return { success: false, message: "Failed to update timezone." };
    }
}
