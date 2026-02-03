'use server';

import { getAuthenticatedUser } from "@/lib/auth/user-guard";
import { db } from "@/lib/db";
import { checkMaintenanceMode } from "@/lib/security";
import { revalidatePath } from "next/cache";
import { uploadFileToCloud } from "@/lib/utils/upload";
import { KycStatus, UserRole } from "@prisma/client";

export async function submitKyc(prevState: any, formData: FormData) {
    const { success, message, user } = await getAuthenticatedUser();

    if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }

    if (!success || !user) {
        return { message };
    }

    try {
        // 1. Check if already verified
        if (user.kycStatus === KycStatus.VERIFIED) {
            return { message: "You are already verified." };
        }
        if (user.kycStatus === KycStatus.PENDING) {
            return { message: "Verification already in progress." };
        }

        // 2. Get Files
       const passportFile = formData.get("passport") as File;
        const idFrontFile = formData.get("idCardFront") as File;
        const idBackFile = formData.get("idCardBack") as File;

     if (!idFrontFile || !idBackFile || idFrontFile.size === 0 || idBackFile.size === 0) {
            return { success: false, message: "Please upload both Front and Back of the ID Card." };
        }

        if (!passportFile || passportFile.size === 0) {
            return { success: false, message: "Passport photo is required." };
        }

        // 3. Upload Files
     const [passportUrl, frontUrl, backUrl] = await Promise.all([
            uploadFileToCloud(passportFile, "avatars"),
            uploadFileToCloud(idFrontFile, "kyc"),
            uploadFileToCloud(idBackFile, "kyc")
        ]);

        // 4. CRITICAL DB UPDATE
     await db.user.update({
            where: { id: user.id },
            data: {
                passportUrl: passportUrl,
                idCardUrl: frontUrl,
                idCardBackUrl: backUrl,
                kycStatus: "PENDING",
                kycRejectionReason: null
            }
        });

        // 5. NOTIFY ADMINS
        try {
            const admins = await db.user.findMany({
                where: { role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] } },
                select: { id: true }
            });

            if (admins.length > 0) {
                await db.notification.createMany({
                    data: admins.map((admin) => ({
                        userId: admin.id,
                        title: "KYC Submission Received",
                        message: `User ${user.fullName || 'User'} submitted documents for verification.`,
                        type: "INFO",
                        link: `/admin/users/${user.id}`,
                        isRead: false
                    }))
                });
            }
        } catch (notifyErr) {
            console.error("KYC Admin Notification Failed:", notifyErr);
        }

    } catch (err: any) {
        console.error("KYC Error:", err);
        return { success: false, message: err.message || "Submission failed." };
    }

    revalidatePath("/dashboard/verify");
    revalidatePath("/dashboard");

    return { success: true, message: "Documents submitted successfully. Awaiting Review." };
}