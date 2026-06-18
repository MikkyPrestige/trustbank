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
    CardStatus,
    KycStatus
} from "@prisma/client";
import { uploadFileToCloud } from "@/lib/utils/upload";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { canPerform } from "@/lib/auth/permissions";
import { z } from "zod";
import { logSecurityEvent } from "@/lib/utils/security-logger";

const sanitize = (str: string) => str.replace(/<[^>]*>/g, '');

const createUserSchema = z.object({
  email: z.string().email("Invalid email address").max(100),
  fullName: z.string().min(2, "Name is required").max(100),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().max(30, "Phone must be 30 characters or less").optional(),
  address: z.string().max(200, "Address must be 200 characters or less").optional(),
  city: z.string().max(100, "City must be 100 characters or less").optional(),
  country: z.string().max(100, "Country must be 100 characters or less").optional(),
  zipCode: z.string().max(20, "Zip code must be 20 characters or less").optional(),
  occupation: z.string().max(100, "Occupation must be 100 characters or less").optional(),
  gender: z.string().max(20, "Gender must be 20 characters or less").optional(),
  taxId: z.string().max(50, "Tax ID must be 50 characters or less").optional(),
  dateOfBirth: z.string().optional(),
});

const resetSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

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


export async function adminCreateUser(formData: FormData) {
    const { authorized, session } = await checkAdminAction();

    if (!authorized || !session || !session.user) return { success: false, message: "Unauthorized" };
    if (!canPerform(session.user.role as UserRole, 'MONEY')) return { success: false, message: "Insufficient permissions. Only Admins can perform this actions" };

    // Check for KYC files early so we can report clearly if upload fails
    const passportFile = formData.get("passport") as File | null;
    const idFrontFile = formData.get("idCardFront") as File | null;
    const idBackFile = formData.get("idCardBack") as File | null;
    const hasKycFiles = !!(passportFile?.size && idFrontFile?.size && idBackFile?.size);

    const rawData = {
  email: formData.get("email") as string,
  fullName: formData.get("fullName") as string,
  password: formData.get("password") as string,
  phone: formData.get("phone") as string || undefined,
  address: formData.get("address") as string || undefined,
  city: formData.get("city") as string || undefined,
  country: formData.get("country") as string || undefined,
  zipCode: formData.get("zipCode") as string || undefined,
  occupation: formData.get("occupation") as string || undefined,
  gender: formData.get("gender") as string || undefined,
  taxId: formData.get("taxId") as string || undefined,
  dateOfBirth: formData.get("dateOfBirth") as string || undefined,
};

const validated = createUserSchema.safeParse(rawData);
if (!validated.success) {
  return { success: false, message: validated.error.issues[0].message };
}

const { email,
    fullName,
    password,
    phone,
    address,
    city,
    country,
    zipCode,
    occupation,
    gender,
    taxId,
    dateOfBirth: dateOfBirthStr
} = validated.data;

// Sanitise text that will be displayed or stored
const safeFullName = sanitize(fullName);
const safeAddress = address ? sanitize(address) : undefined;
const safeCity = city ? sanitize(city) : undefined;
const safeCountry = country ? sanitize(country) : undefined;
const safeOccupation = occupation ? sanitize(occupation) : undefined;
const safeTaxId = taxId ? sanitize(taxId) : undefined;
const safeZipCode = zipCode ? sanitize(zipCode) : undefined;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return { success: false, message: "Email already in use." };

    let kycUploaded = false;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const checkingNum = await generateUniqueNumber("10", 'account');
        const savingsNum = await generateUniqueNumber("20", 'account');
        const routingNum = generateRoutingNumber();

        const newUser = await db.$transaction(async (tx) => {
            return await tx.user.create({
                data: {
                    email,
                    fullName: safeFullName,
                    passwordHash: hashedPassword,
                    role: UserRole.CLIENT, status: UserStatus.ACTIVE,
                    emailVerified: new Date(),
                    transactionPin: Math.floor(1000 + Math.random() * 9000).toString(),
                    phone: phone || undefined,
                    address: safeAddress || undefined,
                    city: safeCity || undefined,
                    country: safeCountry || undefined,
                    zipCode: safeZipCode || undefined,
                    occupation: safeOccupation || undefined,
                    gender: gender || null,
                    dateOfBirth: dateOfBirthStr ? new Date(dateOfBirthStr) : null,
                    taxId: safeTaxId || undefined,
                    accounts: {
                        create: [
                            { accountName: `${safeFullName} - Checking`,
                            type: AccountType.CHECKING,
                            accountNumber: checkingNum,
                            routingNumber: routingNum,
                            availableBalance: 0,
                            currentBalance: 0,
                            currency: "USD",
                            status: AccountStatus.ACTIVE, isPrimary: true
                        },
                            { accountName: `${safeFullName} - Savings`,
                            type: AccountType.SAVINGS,
                            accountNumber: savingsNum,
                            routingNumber: routingNum,
                            availableBalance: 0,
                            currentBalance: 0,
                            currency: "USD",
                            status: AccountStatus.ACTIVE,
                            isPrimary: false
                        }
                        ]
                    }
                }
            });
        });

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

        await logAdminAction(
            "CREATE_USER",
            newUser.id,
            { email, admin: session.user.email },
            "INFO",
            "SUCCESS"
        );

await logSecurityEvent({
  action: "ADMIN_CREATE_USER",
  level: "INFO",
  details: { email, createdUserId: newUser.id },
  adminId: session.user.id,
  userId: newUser.id,
});

        // Optional KYC upload — upload files and verify immediately
        if (hasKycFiles) {
            try {
                const [passportUrl, frontUrl, backUrl] = await Promise.all([
                    uploadFileToCloud(passportFile!, "avatars"),
                    uploadFileToCloud(idFrontFile!, "kyc"),
                    uploadFileToCloud(idBackFile!, "kyc"),
                ]);

                await db.user.update({
                    where: { id: newUser.id },
                    data: {
                        passportUrl,
                        idCardUrl: frontUrl,
                        idCardBackUrl: backUrl,
                        kycStatus: KycStatus.VERIFIED,
                    }
                });

                kycUploaded = true;
            } catch (uploadErr) {
                console.error("KYC Upload Error during user creation:", uploadErr);
            }
        }

    } catch (err) {
        console.error("Create User Error:", err);
        return { success: false, message: "Database error. Failed to create user." };
    }

    revalidatePath("/admin/users");

    if (kycUploaded) {
        return { success: true, message: "User created and identity verified successfully." };
    }
    if (hasKycFiles) {
        return { success: true, message: "User created, but KYC upload failed. Please upload documents from the user profile page." };
    }
    return { success: true, message: "User created with Checking & Savings accounts." };
}


export async function toggleUserStatus(userId: string, newStatus: string) {
    const { authorized, session } = await checkAdminAction();

    if (!authorized || !session || !session.user) return { success: false, message: "Unauthorized" };

    if (userId === session.user.id) {
  return { success: false, message: "You cannot modify your own status." };
}

    if (!canPerform(session.user.role as UserRole, 'MONEY')) return { success: false, message: "Insufficient permissions. Only Admins can perform this actions" };

    if (!Object.values(UserStatus).includes(newStatus as UserStatus)) return { success: false, message: "Invalid status." };

    try {
        const targetUser = await db.user.findUnique({ where: { id: userId } });
        if (targetUser?.role === UserRole.SUPER_ADMIN) return { success: false, message: "Cannot modify Super Admin status." };

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

        const logLevel = (newStatus === 'FROZEN' || newStatus === 'SUSPENDED') ? 'WARNING' : 'INFO';

        await logAdminAction(
            "UPDATE_STATUS",
            userId,
            { status: newStatus, note: "Cards mirrored", admin: session.user.email },
            logLevel,
            "SUCCESS"
        );

        await logSecurityEvent({
  action: "ADMIN_USER_STATUS_CHANGE",
  level: (newStatus === 'FROZEN' || newStatus === 'SUSPENDED') ? "CRITICAL" : "WARNING",
  details: {
    targetUserId: userId,
    oldStatus: targetUser?.status,
    newStatus,
    adminEmail: session.user.email,
  },
  adminId: session.user.id,
  userId: userId,
});

    } catch (err) {
        console.error("Status Update Error:", err);
        return { success: false, message: "Failed to update status." };
    }

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    return { success: true, message: `User status updated to ${newStatus}. Cards synced.` };
}


export async function deleteUser(userId: string) {
    const { authorized, session } = await checkAdminAction();

    if (!authorized || !session || !session.user) return { success: false, message: "Unauthorized" };

    if (!canPerform(session.user.role as UserRole, 'MONEY')) {
        return { success: false, message: "Insufficient permissions. Only Admins can perform this action." };
    }

    try {
        const targetUser = await db.user.findUnique({ where: { id: userId } });

        if (!targetUser) return { success: false, message: "User not found." };
        if (targetUser.role === UserRole.SUPER_ADMIN) return { success: false, message: "Attempt to delete Super Admin blocked." };

        await db.user.update({
            where: { id: userId },
            data: {
                status: 'ARCHIVED',
                email: `deleted-${Date.now()}_${targetUser.email}`,
                phone: null
            }
        });

        await logAdminAction(
            "DELETE_USER",
            userId,
            {
                action: "ARCHIVED_USER",
                originalEmail: targetUser.email,
                admin: session.user.email
            },
            "CRITICAL",
            "SUCCESS"
        );

        await logSecurityEvent({
  action: "ADMIN_DELETE_USER",
  level: "CRITICAL",
  details: {
    targetUserId: userId,
    originalEmail: targetUser.email,
    adminEmail: session.user.email,
  },
  adminId: session.user.id,
  userId: userId,
});

    } catch (err) {
        console.error("Delete User Error:", err);
        return { success: false, message: "Failed to archive user." };
    }

    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { success: true, message: "User deleted (archived) successfully." };
}

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

        await db.$transaction(async (tx) => {
            await tx.card.create({
                data: {
                    userId,
                    type: CardType.VISA,
                    cardNumber,
                    cvv,
                    expiryDate,
                    pin: user.transactionPin || Math.floor(1000 + Math.random() * 9000).toString(),
                    status: CardStatus.ACTIVE,
                    isPhysical: false
                }
            });
        });

        // 2. SIDE EFFECTS
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

        await logAdminAction(
            "ISSUE_CARD",
            userId,
            { type: "VISA", admin: session.user.email },
            "INFO",
            "SUCCESS"
        );


        await logSecurityEvent({
  action: "ADMIN_ISSUE_CARD",
  level: "WARNING",
  details: {
    targetUserId: userId,
    adminEmail: session.user.email,
  },
  adminId: session.user.id,
  userId: userId,
});

    } catch (err) {
        console.error(err);
        return { message: "Failed to issue card" };
    }

    revalidatePath("/admin/users");
    return { success: true, message: "New Card Issued" };
}

export async function adminResetPassword(prevState: any, formData: FormData) {
    const { authorized, session } = await checkAdminAction();

    if (!authorized || !session || !session.user) {
        return { success: false, message: "Unauthorized" };
    }

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

        await db.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: {
                    passwordHash: hashedPassword,
                    failedLoginAttempts: 0,
                    failedPinAttempts: 0,
                    pinLockedUntil: null
                }
            });
        });

        await logSecurityEvent({
  action: "ADMIN_PASSWORD_RESET",
  level: "CRITICAL",
  details: {
    targetUserId: userId,
    adminEmail: session.user.email,
  },
  adminId: session.user.id,
  userId: userId,
});

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

        await logAdminAction(
            "RESET_PASSWORD",
            userId,
            { method: "Admin Console", admin: session.user.email },
            "WARNING",
            "SUCCESS"
        );

    } catch (error) {
        console.error("Admin Reset Error:", error);
        return { success: false, message: "Database update failed." };
    }

    revalidatePath("/admin/users");
    return { success: true, message: "Password reset successfully." };
}

export async function adminEditUser(userId: string, formData: FormData) {
    const { authorized, session } = await checkAdminAction();

    if (!authorized || !session || !session.user) return { success: false, message: "Unauthorized" };
    if (!canPerform(session.user.role as UserRole, 'EDIT')) return { success: false, message: "Insufficient permissions." };

    const dateOfBirth = formData.get("dateOfBirth") as string | null;
    const gender = formData.get("gender") as string | null;

    try {
        const targetUser = await db.user.findUnique({ where: { id: userId } });
        if (!targetUser) return { success: false, message: "User not found." };

        await db.user.update({
            where: { id: userId },
            data: {
                ...(dateOfBirth ? { dateOfBirth: new Date(dateOfBirth) } : {}),
                ...(gender ? { gender: sanitize(gender) } : {}),
            }
        });

        await logAdminAction(
            "EDIT_USER_PROFILE",
            userId,
            { fields: "dateOfBirth, gender", admin: session.user.email },
            "INFO",
            "SUCCESS"
        );

    } catch (err) {
        console.error("Admin Edit User Error:", err);
        return { success: false, message: "Failed to update user profile." };
    }

    revalidatePath(`/admin/users/${userId}`);
    return { success: true, message: "User profile updated successfully." };
}

export async function unlockUserSecurity(userId: string) {
    const { authorized, session } = await checkAdminAction();
    if (!authorized || !session || !session.user) return { success: false, message: "Unauthorized" };

    try {
        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) return { success: false, message: "User not found" };

        await db.user.update({
            where: { id: userId },
            data: {
                failedPinAttempts: 0,
                pinLockedUntil: null,
                failedLoginAttempts: 0,
            }
        });

        await logSecurityEvent({
  action: "ADMIN_UNLOCK_USER",
  level: "WARNING",
  details: {
    targetUserId: userId,
    previousStatus: user.status,
    adminEmail: session.user.email,
  },
  adminId: session.user.id,
  userId: userId,
});

        try {
            await db.adminLog.deleteMany({
                where: {
                    targetId: user.email,
                    action: "LOGIN_FAILED"
                }
            });
        } catch (e) {
            console.log("No logs to clear");
        }

        await db.notification.create({
            data: {
                userId,
                title: "Security Lock Removed",
                message: "Your account security restrictions have been lifted by administrator.",
                type: "SUCCESS",
                link: "/login",
                isRead: false
            }
        });

        revalidatePath(`/admin/users/${userId}`);
        return { success: true, message: "Account & IP restrictions cleared." };
    } catch (error) {
        console.error("Unlock Error:", error);
        return { success: false, message: "Failed to unlock user." };
    }
}