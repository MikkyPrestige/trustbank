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
            // ✅ STEP 1: CRITICAL DB UPDATE (Fast Transaction)
            await db.$transaction(async (tx) => {
                await tx.user.update({
                    where: { id: userId },
                    data: { kycStatus: KycStatus.VERIFIED }
                });
            });

            // ✅ STEP 2: SIDE EFFECTS (Outside Transaction)
            // If these fail, the user is still verified (which is what matters most)

            // Log Action
            await logAdminAction("KYC_APPROVE", userId, {
                details: "Identity Verified by Admin",
                admin: session.user.email
            });

            // Notify User
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

        } else {
            // --- REJECTION LOGIC ---
            if (!reason) return { success: false, message: "Rejection reason is required." };

            // ✅ STEP 1: CRITICAL UPDATE
            await db.$transaction(async (tx) => {
                await tx.user.update({
                    where: { id: userId },
                    data: { kycStatus: KycStatus.FAILED }
                });
            });

            // ✅ STEP 2: SIDE EFFECTS
            await logAdminAction("KYC_REJECT", userId, {
                reason: reason,
                admin: session.user.email
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

// 'use server';

// import { db } from "@/lib/db";
// import { revalidatePath } from "next/cache";
// import { checkAdminAction } from "@/lib/admin-auth";
// import { logAdminAction } from "@/lib/admin-logger";
// import { KycStatus } from "@prisma/client";

// // --- APPROVE / REJECT KYC ---
// export async function processKyc(userId: string, decision: 'APPROVE' | 'REJECT', reason?: string) {
//     // 1. Security Check
//     const { authorized, session } = await checkAdminAction();
//     if (!authorized) return { success: false, message: "Unauthorized" };

//     try {
//         const user = await db.user.findUnique({ where: { id: userId } });
//         if (!user) return { success: false, message: "User not found" };

//         if (decision === 'APPROVE') {
//             // --- APPROVAL LOGIC ---
//             await db.$transaction(async (tx) => {
//                 // 1. Update User Status
//                 await tx.user.update({
//                     where: { id: userId },
//                     data: {
//                         kycStatus: KycStatus.VERIFIED
//                     }
//                 });

//                 // 2. Log Action
//                 await logAdminAction("KYC_APPROVE", userId, {
//                     details: "Identity Verified by Admin",
//                     admin: session?.user?.email
//                 });

//                 // 👇 NEW: NOTIFY USER (SUCCESS)
//                 await tx.notification.create({
//                     data: {
//                         userId: userId,
//                         title: "Identity Verified",
//                         message: "Congratulations! Your identity verification has been approved. You now have full access to all banking features.",
//                         type: "SUCCESS", // Green alert
//                         link: "/dashboard/settings",
//                         isRead: false
//                     }
//                 });
//                 // 👆 END NEW CODE
//             });

//         } else {
//             // --- REJECTION LOGIC ---
//             if (!reason) return { success: false, message: "Rejection reason is required." };

//             await db.$transaction(async (tx) => {
//                 // 1. Update User Status to FAILED
//                 await tx.user.update({
//                     where: { id: userId },
//                     data: {
//                         kycStatus: KycStatus.FAILED
//                     }
//                 });

//                 // 2. Log Action
//                 await logAdminAction("KYC_REJECT", userId, {
//                     reason: reason,
//                     admin: session?.user?.email
//                 });

//                 // 👇 NEW: NOTIFY USER (FAILURE)
//                 await tx.notification.create({
//                     data: {
//                         userId: userId,
//                         title: "Verification Rejected",
//                         message: `Your KYC documents were not accepted. Reason: ${reason}. Please upload valid documents to proceed.`,
//                         type: "ERROR", // Red alert
//                         link: "/dashboard/verify", // Link back to upload page
//                         isRead: false
//                     }
//                 });
//                 // 👆 END NEW CODE
//             });
//         }

//     } catch (error) {
//         console.error("KYC Process Error:", error);
//         return { success: false, message: "System error processing KYC." };
//     }

//     // ✅ REVALIDATE
//     revalidatePath("/admin/verify");
//     revalidatePath(`/admin/users/${userId}`);

//     return {
//         success: true,
//         message: decision === 'APPROVE' ? "User Verified Successfully" : "KYC Rejected"
//     };
// }