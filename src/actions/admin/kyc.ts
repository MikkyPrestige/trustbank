'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { logAdminAction } from "@/lib/utils/admin-logger";
import { canPerform } from "@/lib/auth/permissions";
import { KycStatus, UserRole } from "@prisma/client";
import { logSecurityEvent } from "@/lib/utils/security-logger";
import { uploadFileToCloud } from "@/lib/utils/upload";

const sanitize = (str: string) => str.replace(/<[^>]*>/g, '');

export async function processKyc(userId: string, decision: 'APPROVE' | 'REJECT', reason?: string) {
    const { authorized, session } = await checkAdminAction();

    if (!authorized || !session || !session.user) {
        return { success: false, message: "Unauthorized" };
    }

    if (!canPerform(session.user.role as UserRole, 'EDIT')) {
        return { success: false, message: "Insufficient permissions. Access Level: EDIT required." };
    }

    try {
        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) return { success: false, message: "User not found" };

        if (decision === 'APPROVE') {
            await db.$transaction(async (tx) => {
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        kycStatus: KycStatus.VERIFIED,
                        kycRejectionReason: null
                    }
                });
            });

            await db.notification.create({
                data: {
                    userId: userId,
                    title: "Identity Verified",
                    message: "Congratulations! Your identity verification has been approved. You now have full access to all banking features.",
                    type: "SUCCESS",
                    link: "/dashboard/settings",
                    isRead: false
                }
            });

            await logAdminAction(
                "KYC_APPROVE",
                userId,
                {
                    details: "Identity Verified by Admin",
                    admin: session.user.email
                },
                "INFO",
                "SUCCESS"
            );

            await logSecurityEvent({
  action: "ADMIN_KYC_APPROVE",
  level: "INFO",
  details: {
    targetUserId: userId,
    adminEmail: session.user.email,
  },
  adminId: session.user.id,
  userId: userId,
});

        } else {
            if (!reason) return { success: false, message: "Rejection reason is required." };
            const safeReason = sanitize(reason);

            await db.$transaction(async (tx) => {
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        kycStatus: KycStatus.FAILED,
                        kycRejectionReason: safeReason
                    }
                });
            });

            await db.notification.create({
                data: {
                    userId: userId,
                    title: "Verification Rejected",
                    message: `Your KYC documents were not accepted. Reason: ${safeReason}. Please upload valid documents to proceed.`,
                    type: "ERROR",
                    link: "/dashboard/verify",
                    isRead: false
                }
            });

            await logAdminAction(
                "KYC_REJECT",
                userId,
                {
                    reason: safeReason,
                    admin: session.user.email
                },
                "WARNING",
                "SUCCESS"
            );

            await logSecurityEvent({
  action: "ADMIN_KYC_REJECT",
  level: "WARNING",
  details: {
    targetUserId: userId,
    reason: safeReason,
    adminEmail: session.user.email,
  },
  adminId: session.user.id,
  userId: userId,
});
        }

    } catch (error) {
        console.error("KYC Process Error:", error);
        return { success: false, message: "System error processing KYC." };
    }

    revalidatePath("/admin/verify");
    revalidatePath(`/admin/users/${userId}`);

    return {
        success: true,
        message: decision === 'APPROVE' ? "User Verified Successfully" : "KYC Rejected"
    };
}

export async function adminUploadKyc(userId: string, formData: FormData) {
    const { authorized, session } = await checkAdminAction();

    if (!authorized || !session || !session.user) {
        return { success: false, message: "Unauthorized" };
    }

    if (!canPerform(session.user.role as UserRole, 'EDIT')) {
        return { success: false, message: "Insufficient permissions. Access Level: EDIT required." };
    }

    try {
        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) return { success: false, message: "User not found" };

        const passportFile = formData.get("passport") as File | null;
        const idFrontFile = formData.get("idCardFront") as File | null;
        const idBackFile = formData.get("idCardBack") as File | null;

        if (!passportFile || passportFile.size === 0) {
            return { success: false, message: "Passport photo is required." };
        }
        if (!idFrontFile || idFrontFile.size === 0 || !idBackFile || idBackFile.size === 0) {
            return { success: false, message: "Please upload both Front and Back of the ID Card." };
        }

        const [passportUrl, frontUrl, backUrl] = await Promise.all([
            uploadFileToCloud(passportFile, "avatars"),
            uploadFileToCloud(idFrontFile, "kyc"),
            uploadFileToCloud(idBackFile, "kyc"),
        ]);

        await db.user.update({
            where: { id: userId },
            data: {
                passportUrl,
                idCardUrl: frontUrl,
                idCardBackUrl: backUrl,
                kycStatus: KycStatus.VERIFIED,
                kycRejectionReason: null,
            }
        });

        await db.notification.create({
            data: {
                userId,
                title: "Identity Verified",
                message: "Your identity documents have been uploaded and verified by an administrator.",
                type: "SUCCESS",
                link: "/dashboard/settings",
                isRead: false,
            }
        });

        await logAdminAction(
            "KYC_ADMIN_UPLOAD",
            userId,
            { details: "KYC uploaded and verified by Admin", admin: session.user.email },
            "INFO",
            "SUCCESS"
        );

        await logSecurityEvent({
            action: "ADMIN_KYC_UPLOAD",
            level: "INFO",
            details: { targetUserId: userId, adminEmail: session.user.email },
            adminId: session.user.id,
            userId,
        });

    } catch (error) {
        console.error("Admin KYC Upload Error:", error);
        return { success: false, message: "Failed to upload KYC documents. Ensure files are valid images under 10MB." };
    }

    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/verify");

    return { success: true, message: "Documents uploaded and user verified successfully." };
}