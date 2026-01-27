'use server';

import { getAuthenticatedUser } from "@/lib/auth/user-guard";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";

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
        // 1. CRITICAL DB WRITE (Fast)
        await db.user.update({
            where: { id: user.id },
            data: {
                ...otherData,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined
            }
        });

        // 2. NOTIFY ADMINS (Moved Outside)
        // We use a separate try/catch so a notification failure doesn't error the profile update
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

        // 2. Security Notification (Best Practice)
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

// --- 3. CHANGE PIN (With Reset Logic) ---
export async function changePin(prevState: any, formData: FormData) {
      const { success, message, user } = await getAuthenticatedUser();

   if (!success || !user) {
        return { success: false, message };
    }

    const rawData = Object.fromEntries(formData.entries());
    const validated = pinSchema.safeParse(rawData);

    if (!validated.success) return { message: validated.error.issues[0].message };
    const { currentPassword, newPin } = validated.data;

    try {
        if (!user.passwordHash) return { message: "User has no password set." };
        // Verify Password (Master Key) before changing PIN
        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) return { message: "Incorrect Password. Cannot update PIN." };
        // 1. Update PIN
        await db.user.update({
            where: { id: user.id },
            data: {
                transactionPin: newPin,
                failedPinAttempts: 0,
                pinLockedUntil: null
            }
        });

        // 2. Security Notification
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
        return { message: "Failed to update PIN." };
    }

    revalidatePath("/dashboard/settings");
    return { success: true, message: "Transaction PIN Updated!" };
}




// 'use server';

// import { auth } from "@/auth";
// import { db } from "@/lib/db";
// import { revalidatePath } from "next/cache";
// import bcrypt from "bcryptjs";
// import { z } from "zod";

// // --- SCHEMAS ---
// const profileSchema = z.object({
//     fullName: z.string().min(2, "Name is required").optional(),
//     occupation: z.string().optional(),
//     gender: z.string().optional(),
//     dateOfBirth: z.string().optional(),
//     phone: z.string().optional(),
//     taxId: z.string().optional(),

//     // Address
//     address: z.string().optional(),
//     city: z.string().optional(),
//     country: z.string().optional(),
//     zipCode: z.string().optional(),

//     // Next of Kin
//     nokName: z.string().optional(),
//     nokPhone: z.string().optional(),
//     nokRelationship: z.string().optional(),
//     nokEmail: z.string().email("Invalid email").optional().or(z.literal("")),
//     nokAddress: z.string().optional(),

//     // URLs
//     image: z.string().optional(),
//     passportUrl: z.string().optional(),
//     idCardUrl: z.string().optional(),
// });

// const passwordSchema = z.object({
//     currentPassword: z.string().min(1, "Current password required"),
//     newPassword: z.string().min(6, "New password must be 6+ chars"),
// });

// const pinSchema = z.object({
//     currentPassword: z.string().min(1, "Password required for authorization"),
//     newPin: z.string().length(4, "PIN must be exactly 4 digits"),
// });

// // --- 1. UPDATE PROFILE ---
// export async function updateProfile(prevState: any, formData: FormData) {
//     const session = await auth();
//     if (!session?.user?.id) return { message: "Unauthorized" };

//     const rawData = Object.fromEntries(formData.entries());
//     const validated = profileSchema.safeParse(rawData);

//     if (!validated.success) {
//         return { message: "Invalid inputs. Please check your data." };
//     }

//     const { dateOfBirth, ...otherData } = validated.data;

//     try {
//         // 👇 CHANGED: Wrapped in transaction to notify Admins
//         await db.$transaction(async (tx) => {

//             // A. Update User Data
//             await tx.user.update({
//                 where: { id: session.user.id },
//                 data: {
//                     ...otherData,
//                     // ✅ SAFE DATE PARSING
//                     dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined
//                 }
//             });

//             // 👇 NEW: NOTIFY ADMINS (Compliance Alert)
//             // If a user changes address or name, admins should know.
//             const admins = await tx.user.findMany({
//                 where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
//                 select: { id: true }
//             });

//             if (admins.length > 0) {
//                 await tx.notification.createMany({
//                     data: admins.map((admin) => ({
//                         userId: admin.id,
//                         title: "User Profile Updated",
//                         message: `User ${session.user.name || 'Client'} updated their profile details.`,
//                         type: "INFO",
//                         link: `/admin/users/${session.user.id}`, // Link to the user detail page
//                         isRead: false
//                     }))
//                 });
//             }
//             // 👆 END NEW CODE
//         });

//     } catch (err) {
//         console.error("Profile Update Error:", err);
//         return { message: "Update failed." };
//     }

//     // ✅ REVALIDATE
//     revalidatePath("/dashboard/settings");
//     revalidatePath("/dashboard");
//     return { success: true, message: "Profile Updated Successfully!" };
// }

// // --- 2. CHANGE PASSWORD ---
// export async function changePassword(prevState: any, formData: FormData) {
//     const session = await auth();
//     if (!session?.user?.id) return { message: "Unauthorized" };

//     const rawData = Object.fromEntries(formData.entries());
//     const validated = passwordSchema.safeParse(rawData);

//     if (!validated.success) return { message: validated.error.issues[0].message };
//     const { currentPassword, newPassword } = validated.data;

//     try {
//         const user = await db.user.findUnique({ where: { id: session.user.id } });
//         if (!user || !user.passwordHash) return { message: "User not found" };

//         // A. Validate OLD Password
//         const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
//         if (!isMatch) return { message: "Incorrect Current Password" };

//         // B. Hash NEW Password
//         const hashedPassword = await bcrypt.hash(newPassword, 10);

//         // C. Update
//         await db.user.update({
//             where: { id: session.user.id },
//             data: { passwordHash: hashedPassword }
//         });

//     } catch (err) {
//         return { message: "Failed to change password." };
//     }

//     revalidatePath("/dashboard/settings");
//     return { success: true, message: "Password Changed Successfully!" };
// }

// // --- 3. CHANGE PIN (With Reset Logic) ---
// export async function changePin(prevState: any, formData: FormData) {
//     const session = await auth();
//     if (!session?.user?.id) return { message: "Unauthorized" };

//     const rawData = Object.fromEntries(formData.entries());
//     const validated = pinSchema.safeParse(rawData);

//     if (!validated.success) return { message: validated.error.issues[0].message };
//     const { currentPassword, newPin } = validated.data;

//     try {
//         const user = await db.user.findUnique({ where: { id: session.user.id } });
//         if (!user || !user.passwordHash) return { message: "User not found" };

//         // A. Validate Password (Master Key Check)
//         const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
//         if (!isMatch) return { message: "Incorrect Password. Cannot update PIN." };

//         // B. Update PIN AND Reset Lockout
//         await db.user.update({
//             where: { id: session.user.id },
//             data: {
//                 transactionPin: newPin,
//                 failedPinAttempts: 0, // 👈 RESET FAILURES
//                 pinLockedUntil: null  // 👈 UNLOCK ACCOUNT
//             }
//         });

//     } catch (err) {
//         return { message: "Failed to update PIN." };
//     }

//     revalidatePath("/dashboard/settings");
//     return { success: true, message: "Transaction PIN Updated!" };
// }