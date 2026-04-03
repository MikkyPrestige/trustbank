'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { logAdminAction } from "@/lib/utils/admin-logger";
import { canPerform } from "@/lib/auth/permissions";
import { KycStatus, UserRole } from "@prisma/client";

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

        } else {
            if (!reason) return { success: false, message: "Rejection reason is required." };

            await db.$transaction(async (tx) => {
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        kycStatus: KycStatus.FAILED,
                        kycRejectionReason: reason
                    }
                });
            });

            await db.notification.create({
                data: {
                    userId: userId,
                    title: "Verification Rejected",
                    message: `Your KYC documents were not accepted. Reason: ${reason}. Please upload valid documents to proceed.`,
                    type: "ERROR",
                    link: "/dashboard/verify",
                    isRead: false
                }
            });

            await logAdminAction(
                "KYC_REJECT",
                userId,
                {
                    reason: reason,
                    admin: session.user.email
                },
                "WARNING",
                "SUCCESS"
            );
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