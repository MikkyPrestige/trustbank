'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/admin-logger";

// 1. APPROVE KYC
export async function approveKyc(userId: string) {
    const { authorized } = await checkAdminAction();
    if (!authorized) return { success: false, message: "Unauthorized" };

    try {
        await db.user.update({
            where: { id: userId },
            data: {
                status: 'ACTIVE',
                kycStatus: 'VERIFIED',
            }
        });

        // Log the action
        await logAdminAction("APPROVE_KYC", userId, { status: "VERIFIED" });

        revalidatePath("/admin/verifications");
        return { success: true, message: "User Verified Successfully" };
    } catch (error) {
        console.error("KYC Approve Error:", error);
        return { success: false, message: "Approval Failed" };
    }
}

// 2. REJECT KYC
export async function rejectKyc(userId: string) {
    const { authorized } = await checkAdminAction();
    if (!authorized) return { success: false, message: "Unauthorized" };

    try {
        // We reset their verification status so they can upload again
        // Keeping status 'ACTIVE' allows them to login and try again
        await db.user.update({
            where: { id: userId },
            data: {
                status: 'ACTIVE',
                kycStatus: 'FAILED',
                passportUrl: null,      // Clear bad docs
                idCardUrl: null
            }
        });

        // Log the action
        await logAdminAction("REJECT_KYC", userId, { reason: "Admin rejected documents" });

        revalidatePath("/admin/verifications");
        return { success: true, message: "Application Rejected. User notified." };
    } catch (error) {
        console.error("KYC Reject Error:", error);
        return { success: false, message: "Rejection Failed" };
    }
}