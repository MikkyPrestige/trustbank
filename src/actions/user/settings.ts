'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";

// --- SCHEMAS ---
const profileSchema = z.object({
    occupation: z.string().optional(),
    gender: z.string().optional(),
    dateOfBirth: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    zipCode: z.string().optional(),
    nokName: z.string().optional(),
    nokPhone: z.string().optional(),
    nokRelationship: z.string().optional(),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password required"),
    newPassword: z.string().min(6, "New password must be 6+ chars"),
});

const pinSchema = z.object({
    currentPassword: z.string().min(1, "Password required for authorization"),
    newPin: z.string().length(4, "PIN must be exactly 4 digits"),
});

// --- UPDATE PROFILE ---
export async function updateProfile(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    const rawData = Object.fromEntries(formData.entries());
    const validated = profileSchema.safeParse(rawData);

    if (!validated.success) return { message: "Invalid inputs" };

    const { dateOfBirth, ...otherData } = validated.data;

    try {
        await db.user.update({
            where: { id: session.user.id },
            data: {
                ...otherData,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined
            }
        });

        revalidatePath("/dashboard/settings");
        return { success: true, message: "Profile Updated Successfully!" };
    } catch (err) {
        console.error(err);
        return { message: "Update failed." };
    }
}

export async function changePassword(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    const rawData = Object.fromEntries(formData.entries());
    const validated = passwordSchema.safeParse(rawData);

    if (!validated.success) return { message: "Invalid password format" };
    const { currentPassword, newPassword } = validated.data;

    try {
        const user = await db.user.findUnique({ where: { id: session.user.id } });
        if (!user || !user.passwordHash) return { message: "User not found" };

        // 1. Validate OLD Password
        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) return { message: "Incorrect Current Password" };

        // 2. Hash NEW Password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 3. Update
        await db.user.update({
            where: { id: session.user.id },
            data: { passwordHash: hashedPassword }
        });

        revalidatePath("/dashboard/settings");
        return { success: true, message: "Password Changed Successfully!" };
    } catch (err) {
        return { message: "Failed to change password." };
    }
}

export async function changePin(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    const rawData = Object.fromEntries(formData.entries());
    const validated = pinSchema.safeParse(rawData);

    if (!validated.success) return { message: "PIN must be 4 digits" };
    const { currentPassword, newPin } = validated.data;

    try {
        const user = await db.user.findUnique({ where: { id: session.user.id } });
        if (!user || !user.passwordHash) return { message: "User not found" };

        // 1. Validate Password (SECURITY CHECK)
        // We use the Password (Master Key) to authorize this, not the old PIN.
        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) return { message: "Incorrect Password. Cannot update PIN." };

        // 2. Update PIN AND Reset Lockout
        await db.user.update({
            where: { id: session.user.id },
            data: {
                transactionPin: newPin,
                failedPinAttempts: 0, // 👈 RESET FAILURES
                pinLockedUntil: null  // 👈 UNLOCK ACCOUNT
            }
        });

        revalidatePath("/dashboard/settings");
        return { success: true, message: "Transaction PIN Updated!" };
    } catch (err) {
        return { message: "Failed to update PIN." };
    }
}