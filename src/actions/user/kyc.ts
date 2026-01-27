'use server';

import { getAuthenticatedUser } from "@/lib/auth/user-guard";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { uploadFileToCloud } from "@/lib/utils/upload";
import { KycStatus, UserRole } from "@prisma/client";

export async function submitKyc(prevState: any, formData: FormData) {
    const { success, message, user } = await getAuthenticatedUser();

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
        const passportFile = formData.get('passport') as File;
        const idFile = formData.get('idCard') as File;

        if (!passportFile || !idFile) {
            return { message: "Please upload both Passport and ID Card." };
        }

        // 3. Upload Files (This takes time, do it before DB write)
        const [passportUrl, idCardUrl] = await Promise.all([
            uploadFileToCloud(passportFile, 'passport'),
            uploadFileToCloud(idFile, 'id_card')
        ]);

        // 4. CRITICAL DB UPDATE (Fast & Atomic)
        await db.user.update({
            where: { id: user.id },
            data: {
                passportUrl,
                idCardUrl,
                kycStatus: KycStatus.PENDING
            }
        });

        // 5. NOTIFY ADMINS (Side Effect - Moved Outside)
        // We run this independently so it doesn't block or revert the KYC submission
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



// 'use server';

// import { auth } from "@/auth";
// import { db } from "@/lib/db";
// import { revalidatePath } from "next/cache";
// import { uploadFileToCloud } from "@/lib/upload";
// import { KycStatus, UserRole } from "@prisma/client";

// export async function submitKyc(prevState: any, formData: FormData) {
//     const session = await auth();
//     if (!session) return { message: "Unauthorized" };

//     try {
//         // 1. Fetch User (Check if already verified)
//         const user = await db.user.findUnique({ where: { id: session.user.id } });

//         if (!user) return { message: "User not found" };

//         if (user.kycStatus === KycStatus.VERIFIED) {
//             return { message: "You are already verified." };
//         }
//         if (user.kycStatus === KycStatus.PENDING) {
//             return { message: "Verification already in progress." };
//         }

//         // 2. Get Files
//         const passportFile = formData.get('passport') as File;
//         const idFile = formData.get('idCard') as File;

//         if (!passportFile || !idFile) {
//             return { message: "Please upload both Passport and ID Card." };
//         }

//         // 3. Upload Files
//         const [passportUrl, idCardUrl] = await Promise.all([
//             uploadFileToCloud(passportFile, 'passport'),
//             uploadFileToCloud(idFile, 'id_card')
//         ]);

//         // 4. Update Database & Notify Admins
//         // 👇 CHANGED: Wrapped in transaction
//         await db.$transaction(async (tx) => {

//             // A. Update User Record
//             await tx.user.update({
//                 where: { id: session.user.id },
//                 data: {
//                     passportUrl,
//                     idCardUrl,
//                     kycStatus: KycStatus.PENDING
//                 }
//             });

//             // 👇 NEW: NOTIFY ADMINS & SUPER ADMINS
//             const admins = await tx.user.findMany({
//                 where: { role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] } },
//                 select: { id: true }
//             });

//             if (admins.length > 0) {
//                 await tx.notification.createMany({
//                     data: admins.map((admin) => ({
//                         userId: admin.id,
//                         title: "KYC Submission Received",
//                         message: `User ${user.fullName || 'User'} submitted documents for verification.`,
//                         type: "INFO",
//                         link: `/admin/users/${session.user.id}`,
//                         isRead: false
//                     }))
//                 });
//             }
//             // 👆 END NEW CODE
//         });

//     } catch (err: any) {
//         console.error("KYC Error:", err);
//         return { success: false, message: err.message || "Submission failed." };
//     }

//     revalidatePath("/dashboard/verify");
//     revalidatePath("/dashboard");

//     return { success: true, message: "Documents submitted successfully. Awaiting Review." };
// }