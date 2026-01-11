'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// 1. APPROVE KYC
export async function approveKyc(userId: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { success: false, message: "Unauthorized" };

    try {
        await db.user.update({
            where: { id: userId },
            data: {
                status: 'ACTIVE',
                kycVerified: true
            }
        });

        revalidatePath("/admin/verifications");
        return { success: true, message: "User Verified Successfully" };
    } catch (error) {
        return { success: false, message: "Approval Failed" };
    }
}

// 2. REJECT KYC
export async function rejectKyc(userId: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { success: false, message: "Unauthorized" };

    try {
        // We reset their verification status so they can upload again
        await db.user.update({
            where: { id: userId },
            data: {
                status: 'ACTIVE',       // Let them login to see the error
                kycVerified: false,
                passportUrl: null,      // Clear bad docs
                idCardUrl: null
            }
        });

        revalidatePath("/admin/verifications");
        return { success: true, message: "Application Rejected. User notified." };
    } catch (error) {
        return { success: false, message: "Rejection Failed" };
    }
}