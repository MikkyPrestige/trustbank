'use server';

import { db } from "@/lib/db";
import { logAdminAction } from "@/lib/utils/admin-logger";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import {
  UserStatus,
  UserRole,
  AccountType,
  AccountStatus,
  CardType,
  CardStatus
} from "@prisma/client";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { canPerform } from "@/lib/auth/permissions";
import { z } from "zod";

const resetSchema = z.object({
    userId: z.string(),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

// --- HELPER: Generate Unique Numbers ---
async function generateUniqueNumber(prefix: string, model: 'account' | 'card'): Promise<string> {
    let isUnique = false;
    let number = "";
    let attempts = 0;

    while (!isUnique && attempts < 10) {
        const randomSuffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
        if (model === 'card') {
            const longSuffix = Math.floor(Math.random() * 1000000000000000).toString().padStart(15, '0');
            number = `4${longSuffix}`;
        } else {
            number = `${prefix}${randomSuffix}`;
        }
        // @ts-ignore
        const existing = await db[model].findUnique({
            where: model === 'card' ? { cardNumber: number } : { accountNumber: number }
        });
        if (!existing) isUnique = true;
        attempts++;
    }
    return number;
}

function generateRoutingNumber() {
    return "0" + Math.floor(20000000 + Math.random() * 10000000).toString();
}

// 1. CREATE USER (Clients)
// 🛡️ PERMISSION: 'MONEY'
export async function adminCreateUser(formData: FormData) {
    const { authorized, session } = await checkAdminAction();

    if (!authorized || !session || !session.user) return { success: false, message: "Unauthorized" };
    if (!canPerform(session.user.role as UserRole, 'MONEY')) return { success: false, message: "Insufficient permissions. Only Admins can perform this actions" };

    const email = formData.get("email") as string;
    const fullName = formData.get("fullName") as string;
    const password = formData.get("password") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const country = formData.get("country") as string;
    const zipCode = formData.get("zipCode") as string;
    const occupation = formData.get("occupation") as string;
    const gender = formData.get("gender") as string;
    const dateOfBirthStr = formData.get("dateOfBirth") as string;

    if (!email || !password || !fullName) return { success: false, message: "Missing required fields" };

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return { success: false, message: "Email already in use." };

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const checkingNum = await generateUniqueNumber("10", 'account');
        const savingsNum = await generateUniqueNumber("20", 'account');
        const routingNum = generateRoutingNumber();

        // 1. CRITICAL DB WRITE (Transaction)
        const newUser = await db.$transaction(async (tx) => {
            return await tx.user.create({
                data: {
                    email, fullName, passwordHash: hashedPassword, role: UserRole.CLIENT, status: UserStatus.ACTIVE,
                    transactionPin: "0000", phone: phone || undefined, address: address || undefined,
                    city: city || undefined, country: country || undefined, zipCode: zipCode || undefined,
                    occupation: occupation || undefined, gender: gender || null, dateOfBirth: dateOfBirthStr ? new Date(dateOfBirthStr) : null,
                    accounts: {
                        create: [
                            { accountName: `${fullName} - Checking`, type: AccountType.CHECKING, accountNumber: checkingNum, routingNumber: routingNum, availableBalance: 0, currentBalance: 0, currency: "USD", status: AccountStatus.ACTIVE, isPrimary: true },
                            { accountName: `${fullName} - Savings`, type: AccountType.SAVINGS, accountNumber: savingsNum, routingNumber: routingNum, availableBalance: 0, currentBalance: 0, currency: "USD", status: AccountStatus.ACTIVE, isPrimary: false }
                        ]
                    }
                }
            });
        });

        // 2. SIDE EFFECTS (Notifications & Logs) - ✅ MOVED OUTSIDE
        await db.notification.create({
            data: {
                userId: newUser.id,
                title: "Welcome to TrustBank",
                message: "Your account has been successfully created. Please verify your identity to unlock all features.",
                type: "INFO",
                link: "/dashboard/verify",
                isRead: false
            }
        });

        await logAdminAction("CREATE_USER", "NEW_USER", { email, admin: session.user.email });

    } catch (err) {
        console.error("Create User Error:", err);
        return { success: false, message: "Database error. Failed to create user." };
    }

    revalidatePath("/admin/users");
    return { success: true, message: "User created with Checking & Savings accounts." };
}

// 2. TOGGLE FREEZE STATUS
// 🛡️ PERMISSION: 'MONEY'
export async function toggleUserStatus(userId: string, newStatus: string) {
    const { authorized, session } = await checkAdminAction();

    if (!authorized || !session || !session.user) return { success: false, message: "Unauthorized" };
    if (!canPerform(session.user.role as UserRole, 'MONEY')) return { success: false, message: "Insufficient permissions. Only Admins can perform this actions" };
    if (!Object.values(UserStatus).includes(newStatus as UserStatus)) return { success: false, message: "Invalid status." };

    try {
        const targetUser = await db.user.findUnique({ where: { id: userId } });
        if (targetUser?.role === UserRole.SUPER_ADMIN) return { success: false, message: "Cannot modify Super Admin status." };

        // 1. CRITICAL DB WRITE
        await db.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: { status: newStatus as UserStatus }
            });

            if (newStatus === UserStatus.FROZEN || newStatus === UserStatus.SUSPENDED) {
                await tx.card.updateMany({
                    where: { userId: userId },
                    data: { status: CardStatus.BLOCKED }
                });
            }
        });

        // 2. SIDE EFFECTS - ✅ MOVED OUTSIDE
        let title = "Account Status Update";
        let msg = `Your account status is now: ${newStatus}`;
        let type = "INFO";

        if (newStatus === UserStatus.FROZEN) {
            title = "Account Frozen";
            msg = "Your account has been temporarily frozen by an administrator. Please contact support.";
            type = "ERROR";
        } else if (newStatus === UserStatus.ACTIVE) {
            title = "Account Reactivated";
            msg = "Good news! Your account has been fully reactivated.";
            type = "SUCCESS";
        }

        await db.notification.create({
            data: { userId: userId, title: title, message: msg, type: type, link: "/dashboard/support", isRead: false }
        });

        await logAdminAction("UPDATE_STATUS", userId, { status: newStatus, note: "Cards mirrored", admin: session.user.email });

    } catch (err) {
        console.error("Status Update Error:", err);
        return { success: false, message: "Failed to update status." };
    }

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    return { success: true, message: `User status updated to ${newStatus}. Cards synced.` };
}

// 3. DELETE USER
// 🛡️ PERMISSION: 'MONEY'
export async function deleteUser(userId: string) {
    const { authorized, session } = await checkAdminAction();

    if (!authorized || !session || !session.user) return { success: false, message: "Unauthorized" };

    // Note: Usually deleting users is a 'users' permission, but I kept 'MONEY' as per your code
    if (!canPerform(session.user.role as UserRole, 'MONEY')) {
        return { success: false, message: "Insufficient permissions. Only Admins can perform this action." };
    }

    try {
        const targetUser = await db.user.findUnique({ where: { id: userId } });

        if (!targetUser) return { success: false, message: "User not found." };
        if (targetUser.role === UserRole.SUPER_ADMIN) return { success: false, message: "Attempt to delete Super Admin blocked." };

        // SOFT DELETE (ARCHIVE)
        await db.user.update({
            where: { id: userId },
            data: {
                status: 'ARCHIVED',
                email: `deleted-${Date.now()}_${targetUser.email}`,
                phone: null
            }
        });

        await logAdminAction("DELETE_USER", "ARCHIVED_USER", {
            originalId: userId,
            admin: session.user.email
        });

    } catch (err) {
        console.error("Delete User Error:", err);
        return { success: false, message: "Failed to archive user." };
    }

    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { success: true, message: "User deleted (archived) successfully." };
}

// 4. ISSUE VISA CARD
// 🛡️ PERMISSION: 'MONEY'
export async function adminIssueCard(userId: string) {
    const { authorized, session } = await checkAdminAction();

    if (!authorized || !session || !session.user) return { message: "Unauthorized" };
    if (!canPerform(session.user.role as UserRole, 'MONEY')) return { message: "Insufficient permissions. Only Admins can perform this actions" };

    try {
        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) return { message: "User not found" };

        const cardNumber = await generateUniqueNumber("", 'card');
        const cvv = Math.floor(100 + Math.random() * 900).toString();
        const date = new Date();
        date.setFullYear(date.getFullYear() + 3);
        const expiryDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getFullYear()).slice(-2)}`;

        // 1. CRITICAL DB WRITE
        await db.$transaction(async (tx) => {
            await tx.card.create({
                data: {
                    userId, type: CardType.VISA, cardNumber, cvv, expiryDate,
                    pin: user.transactionPin || "0000", status: CardStatus.ACTIVE, isPhysical: false
                }
            });
        });

        // 2. SIDE EFFECTS - ✅ MOVED OUTSIDE
        await db.notification.create({
            data: {
                userId: userId,
                title: "New Card Issued",
                message: "A new Virtual Visa Card has been issued to your account.",
                type: "SUCCESS",
                link: "/dashboard/cards",
                isRead: false
            }
        });

        await logAdminAction("ISSUE_CARD", userId, { type: "VISA", admin: session.user.email });

    } catch (err) {
        console.error(err);
        return { message: "Failed to issue card" };
    }

    revalidatePath("/admin/users");
    return { success: true, message: "New Card Issued" };
}

// 5. RESET PASSWORD
// 🛡️ PERMISSION: 'MONEY'
export async function adminResetPassword(prevState: any, formData: FormData) {
    const { authorized, session } = await checkAdminAction();

    // ✅ 1. Session Safety
    if (!authorized || !session || !session.user) {
        return { success: false, message: "Unauthorized" };
    }

    // ✅ 2. Permission Check
    if (!canPerform(session.user.role as UserRole, 'MONEY')) {
        return { success: false, message: "Insufficient permissions. Only Admins can reset passwords." };
    }

    const rawData = Object.fromEntries(formData.entries());
    const validated = resetSchema.safeParse(rawData);

    if (!validated.success) {
        return { success: false, message: "Invalid input." };
    }

    const { userId, newPassword } = validated.data;

    try {
        const target = await db.user.findUnique({ where: { id: userId } });
        if (target?.role === UserRole.SUPER_ADMIN) {
             return { success: false, message: "Cannot reset Super Admin password here." };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 1. CRITICAL DB WRITE
        await db.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: {
                    passwordHash: hashedPassword,
                    failedPinAttempts: 0,
                    pinLockedUntil: null
                }
            });
        });

        // 2. SECURITY NOTIFICATION (Outside Transaction)
        await db.notification.create({
            data: {
                userId: userId,
                title: "Password Reset",
                message: "Your account password was reset by an administrator. If you did not request this, please contact support immediately.",
                type: "WARNING",
                link: "/dashboard/settings",
                isRead: false
            }
        });

        await logAdminAction("RESET_PASSWORD", userId, { method: "Admin Console", admin: session.user.email });

    } catch (error) {
        console.error("Admin Reset Error:", error);
        return { success: false, message: "Database update failed." };
    }

    revalidatePath("/admin/users");
    return { success: true, message: "Password reset successfully." };
}

// 'use server';

// import { db } from "@/lib/db";
// import { logAdminAction } from "@/lib/admin-logger";
// import { revalidatePath } from "next/cache";
// import bcrypt from "bcryptjs";
// import {
//   UserStatus,
//   UserRole,
//   AccountType,
//   AccountStatus,
//   CardType,
//   CardStatus
// } from "@prisma/client";
// import { checkAdminAction } from "@/lib/admin-auth";
// import { z } from "zod";

// // SCHEMA FOR PASSWORD RESET
// const resetSchema = z.object({
//     userId: z.string(),
//     newPassword: z.string().min(6, "Password must be at least 6 characters"),
// });

// // --- HELPER: Generate Unique Numbers ---
// async function generateUniqueNumber(prefix: string, model: 'account' | 'card'): Promise<string> {
//     let isUnique = false;
//     let number = "";
//     let attempts = 0;

//     while (!isUnique && attempts < 10) {
//         const randomSuffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');

//         if (model === 'card') {
//             const longSuffix = Math.floor(Math.random() * 1000000000000000).toString().padStart(15, '0');
//             number = `4${longSuffix}`;
//         } else {
//             number = `${prefix}${randomSuffix}`;
//         }

//         // @ts-ignore - Dynamic model access
//         const existing = await db[model].findUnique({
//             where: model === 'card' ? { cardNumber: number } : { accountNumber: number }
//         });

//         if (!existing) isUnique = true;
//         attempts++;
//     }
//     return number;
// }

// function generateRoutingNumber() {
//     return "0" + Math.floor(20000000 + Math.random() * 10000000).toString();
// }

// // 1. CREATE USER (Clients)
// export async function adminCreateUser(formData: FormData) {
//     const { authorized, session } = await checkAdminAction();
//     if (!authorized) return { success: false, message: "Unauthorized" };

//     const email = formData.get("email") as string;
//     const fullName = formData.get("fullName") as string;
//     const password = formData.get("password") as string;

//     const phone = formData.get("phone") as string;
//     const address = formData.get("address") as string;
//     const city = formData.get("city") as string;
//     const country = formData.get("country") as string;
//     const zipCode = formData.get("zipCode") as string;
//     const occupation = formData.get("occupation") as string;

//     if (!email || !password || !fullName) {
//         return { success: false, message: "Missing required fields" };
//     }

//     const existing = await db.user.findUnique({ where: { email } });
//     if (existing) return { success: false, message: "Email already in use." };

//     try {
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const checkingNum = await generateUniqueNumber("10", 'account');
//         const savingsNum = await generateUniqueNumber("20", 'account');
//         const routingNum = generateRoutingNumber();

//         // Transaction to Create User AND Notify them (if they log in later)
//         await db.$transaction(async (tx) => {
//             const newUser = await tx.user.create({
//                 data: {
//                     email,
//                     fullName,
//                     passwordHash: hashedPassword,
//                     role: UserRole.CLIENT,
//                     status: UserStatus.ACTIVE,
//                     transactionPin: "0000",
//                     phone: phone || undefined,
//                     address: address || undefined,
//                     city: city || undefined,
//                     country: country || undefined,
//                     zipCode: zipCode || undefined,
//                     occupation: occupation || undefined,

//                     accounts: {
//                         create: [
//                             {
//                                 accountName: `${fullName} - Checking`,
//                                 type: AccountType.CHECKING,
//                                 accountNumber: checkingNum,
//                                 routingNumber: routingNum,
//                                 availableBalance: 0,
//                                 currentBalance: 0,
//                                 currency: "USD",
//                                 status: AccountStatus.ACTIVE,
//                                 isPrimary: true
//                             },
//                             {
//                                 accountName: `${fullName} - Savings`,
//                                 type: AccountType.SAVINGS,
//                                 accountNumber: savingsNum,
//                                 routingNumber: routingNum,
//                                 availableBalance: 0,
//                                 currentBalance: 0,
//                                 currency: "USD",
//                                 status: AccountStatus.ACTIVE,
//                                 isPrimary: false
//                             }
//                         ]
//                     }
//                 }
//             });

//             // 👇 NEW: WELCOME NOTIFICATION
//             await tx.notification.create({
//                 data: {
//                     userId: newUser.id,
//                     title: "Welcome to TrustBank",
//                     message: "Your account has been successfully created. Please verify your identity to unlock all features.",
//                     type: "INFO",
//                     link: "/dashboard/verify",
//                     isRead: false
//                 }
//             });
//             // 👆 END NEW CODE
//         });

//         await logAdminAction("CREATE_USER", "NEW_USER", { email, admin: session?.user?.email });

//     } catch (err) {
//         console.error("Create User Error:", err);
//         return { success: false, message: "Database error. Failed to create user." };
//     }

//     revalidatePath("/admin/users");
//     return { success: true, message: "User created with Checking & Savings accounts." };
// }

// // 2. TOGGLE FREEZE STATUS
// export async function toggleUserStatus(userId: string, newStatus: string) {
//     const { authorized, session } = await checkAdminAction();
//     if (!authorized) return { success: false, message: "Unauthorized" };

//     if (!Object.values(UserStatus).includes(newStatus as UserStatus)) {
//         return { success: false, message: "Invalid status provided." };
//     }

//     try {
//         const targetUser = await db.user.findUnique({ where: { id: userId } });
//         if (targetUser?.role === UserRole.SUPER_ADMIN) {
//             return { success: false, message: "Cannot modify Super Admin status." };
//         }

//         await db.$transaction(async (tx) => {
//             // 1. Update User Status
//             await tx.user.update({
//                 where: { id: userId },
//                 data: { status: newStatus as UserStatus }
//             });

//             // 2. Mirror Logic: Freeze Cards if User is Frozen
//             if (newStatus === UserStatus.FROZEN || newStatus === UserStatus.SUSPENDED) {
//                 await tx.card.updateMany({
//                     where: { userId: userId },
//                     data: { status: CardStatus.BLOCKED }
//                 });
//             }

//             // 👇 NEW: NOTIFY USER OF STATUS CHANGE
//             // Define message based on status
//             let title = "Account Status Update";
//             let msg = `Your account status is now: ${newStatus}`;
//             let type = "INFO";

//             if (newStatus === UserStatus.FROZEN) {
//                 title = "Account Frozen";
//                 msg = "Your account has been temporarily frozen by an administrator. Please contact support.";
//                 type = "ERROR";
//             } else if (newStatus === UserStatus.ACTIVE) {
//                 title = "Account Reactivated";
//                 msg = "Good news! Your account has been fully reactivated.";
//                 type = "SUCCESS";
//             }

//             await tx.notification.create({
//                 data: {
//                     userId: userId,
//                     title: title,
//                     message: msg,
//                     type: type, // Using string type here, ensure it matches your Enum or string logic
//                     link: "/dashboard/support",
//                     isRead: false
//                 }
//             });
//             // 👆 END NEW CODE
//         });

//         await logAdminAction("UPDATE_STATUS", userId, { status: newStatus, note: "Cards mirrored", admin: session?.user?.email });

//     } catch (err) {
//         console.error("Status Update Error:", err);
//         return { success: false, message: "Failed to update status." };
//     }

//     revalidatePath("/admin/users");
//     revalidatePath(`/admin/users/${userId}`);

//     return { success: true, message: `User status updated to ${newStatus}. Cards synced.` };
// }

// // 3. DELETE USER
// export async function deleteUser(userId: string) {
//     const { authorized, session } = await checkAdminAction();
//     if (!authorized) return { success: false, message: "Unauthorized" };

//     try {
//         const targetUser = await db.user.findUnique({ where: { id: userId } });
//         if (targetUser?.role === UserRole.SUPER_ADMIN) {
//             return { success: false, message: "Attempt to delete Super Admin blocked." };
//         }

//         // Deleting user removes all their notifications automatically via Cascade
//         await db.user.delete({ where: { id: userId } });
//         await logAdminAction("DELETE_USER", "DELETED_USER", { originalId: userId, admin: session?.user?.email });

//     } catch (err) {
//         return { success: false, message: "Failed to delete user." };
//     }

//     revalidatePath("/admin/users");
//     return { success: true, message: "User deleted permanently." };
// }

// // 4. ISSUE VISA CARD
// export async function adminIssueCard(userId: string) {
//     const { authorized, session } = await checkAdminAction();
//     if (!authorized) return { message: "Unauthorized" };

//     try {
//         const user = await db.user.findUnique({ where: { id: userId } });
//         if (!user) return { message: "User not found" };

//         const cardNumber = await generateUniqueNumber("", 'card');
//         const cvv = Math.floor(100 + Math.random() * 900).toString();

//         const date = new Date();
//         date.setFullYear(date.getFullYear() + 3);
//         const expiryDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getFullYear()).slice(-2)}`;

//         await db.$transaction(async (tx) => {
//             // Create Card
//             await tx.card.create({
//                 data: {
//                     userId,
//                     type: CardType.VISA,
//                     cardNumber,
//                     cvv,
//                     expiryDate,
//                     pin: user.transactionPin || "0000",
//                     status: CardStatus.ACTIVE,
//                     isPhysical: false
//                 }
//             });

//             // 👇 NEW: NOTIFY USER
//             await tx.notification.create({
//                 data: {
//                     userId: userId,
//                     title: "New Card Issued",
//                     message: "A new Virtual Visa Card has been issued to your account.",
//                     type: "SUCCESS",
//                     link: "/dashboard/cards",
//                     isRead: false
//                 }
//             });
//         });

//         await logAdminAction("ISSUE_CARD", userId, { type: "VISA", admin: session?.user?.email });

//     } catch (err) {
//         console.error(err);
//         return { message: "Failed to issue card" };
//     }

//     revalidatePath("/admin/users");
//     return { success: true, message: "New Card Issued" };
// }

// // 5. RESET PASSWORD
// export async function adminResetPassword(prevState: any, formData: FormData) {
//     const { authorized, session } = await checkAdminAction();
//     if (!authorized) return { success: false, message: "Unauthorized: Admins only." };

//     const rawData = Object.fromEntries(formData.entries());
//     const validated = resetSchema.safeParse(rawData);

//     if (!validated.success) {
//         return { success: false, message: "Invalid input." };
//     }

//     const { userId, newPassword } = validated.data;

//     try {
//         const target = await db.user.findUnique({ where: { id: userId } });
//         if (target?.role === UserRole.SUPER_ADMIN) {
//              return { success: false, message: "Cannot reset Super Admin password here." };
//         }

//         const hashedPassword = await bcrypt.hash(newPassword, 10);

//         await db.$transaction(async (tx) => {
//             // Update Password
//             await tx.user.update({
//                 where: { id: userId },
//                 data: {
//                     passwordHash: hashedPassword,
//                     failedPinAttempts: 0,
//                     pinLockedUntil: null
//                 }
//             });

//             // 👇 NEW: SECURITY ALERT NOTIFICATION
//             await tx.notification.create({
//                 data: {
//                     userId: userId,
//                     title: "Password Reset",
//                     message: "Your account password was reset by an administrator. If you did not request this, please contact support immediately.",
//                     type: "WARNING",
//                     link: "/dashboard/settings",
//                     isRead: false
//                 }
//             });
//         });

//         await logAdminAction("RESET_PASSWORD", userId, { method: "Admin Console", admin: session?.user?.email });

//     } catch (error) {
//         console.error("Admin Reset Error:", error);
//         return { success: false, message: "Database update failed." };
//     }

//     revalidatePath("/admin/users");
//     return { success: true, message: "Password reset successfully." };
// }