'use server';

import { getAuthenticatedUser } from "@/lib/auth/user-guard";
import { db } from "@/lib/db";
import { checkMaintenanceMode } from "@/lib/security";
import { revalidatePath } from "next/cache";
import { TransactionStatus } from "@prisma/client";

export async function submitClearanceCode(prevState: any, formData: FormData) {
    const { success, message, user } = await getAuthenticatedUser();

    if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }
    if (!success || !user) return { message };

    const code = formData.get("code") as string;
    const wireId = formData.get("wireId") as string;
    const cleanCode = code ? code.trim().toUpperCase() : "";

    if (!cleanCode || !wireId) return { message: "Invalid Request." };

    const wire = await db.wireTransfer.findUnique({
        where: { id: wireId, userId: user.id },
        include: { user: { select: { fullName: true } } }
    });

    if (!wire) return { message: "Transaction not found." };

    const lockedStatuses: TransactionStatus[] = [
        TransactionStatus.FAILED,
        TransactionStatus.COMPLETED,
        TransactionStatus.PENDING_AUTH
    ];

    if (lockedStatuses.includes(wire.status)) {
        return { message: `Transaction is currently ${wire.status.toLowerCase().replace('_', ' ')}.` };
    }

    let requiredCode = "";
    let nextStage = "";
    let isFinalStage = false;

    // Flow: TAA -> COT -> IMF -> IJY -> ADMIN REVIEW
    if (wire.currentStage === 'TAA') {
        requiredCode = wire.taaCode || "";
        nextStage = 'COT';
    } else if (wire.currentStage === 'COT') {
        requiredCode = wire.cotCode || "";
        nextStage = 'IMF';
    } else if (wire.currentStage === 'IMF') {
        requiredCode = wire.imfCode || "";
        nextStage = 'IJY';
    } else if (wire.currentStage === 'IJY') {
        requiredCode = wire.ijyCode || "";
        isFinalStage = true;
    }

    const isCorrect = requiredCode && (cleanCode === requiredCode.trim().toUpperCase());

    try {
        if (!isCorrect) {
            const attempts = wire.failedAttempts + 1;

            if (attempts >= 5) {
                await db.$transaction(async (tx) => {
                    await tx.wireTransfer.update({
                        where: { id: wireId },
                        data: { status: TransactionStatus.FAILED, failedAttempts: attempts }
                    });

                    // Release the Funds (Principal + Fee) back to Available Balance
                    const totalRelease = Number(wire.amount) + Number(wire.fee);

                    if (wire.accountId) {
                        await tx.account.update({
                            where: { id: wire.accountId },
                            data: { availableBalance: { increment: totalRelease } }
                        });

                        // Mark Ledger as Failed
                        await tx.ledgerEntry.updateMany({
                            where: {
                                referenceId: { contains: wire.id },
                                status: TransactionStatus.ON_HOLD
                            },
                            data: { status: TransactionStatus.FAILED, description: `Wire Failed (Security Alert)` }
                        });
                    }

                    // Notify Admin of Block
                    const admins = await tx.user.findMany({
                        where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
                        select: { id: true }
                    });

                    if (admins.length > 0) {
                        await tx.notification.createMany({
                            data: admins.map(admin => ({
                                userId: admin.id,
                                title: "Security Alert: Wire Blocked",
                                message: `User ${wire.user.fullName} failed clearance 5 times. Transaction cancelled.`,
                                type: "WARNING",
                                link: `/admin/wires?id=${wireId}`,
                                isRead: false
                            }))
                        });
                    }
                });

                return { success: false, message: "Security Limit Reached. Transaction Cancelled." };

            } else {
                // Just update attempts count
                await db.wireTransfer.update({
                    where: { id: wireId },
                    data: { failedAttempts: attempts }
                });
                return { success: false, message: `Invalid Code. ${5 - attempts} attempts remaining.` };
            }

        } else {

            if (isFinalStage) {
                await db.wireTransfer.update({
                    where: { id: wireId },
                    data: {
                        status: TransactionStatus.PENDING_AUTH,
                        currentStage: 'PENDING_APPROVAL'
                    }
                });

                // Notify Admins
                const admins = await db.user.findMany({
                    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
                    select: { id: true }
                });

                if (admins.length > 0) {
                    await db.notification.createMany({
                        data: admins.map(admin => ({
                            userId: admin.id,
                            title: "Action Required: Wire Approval",
                            message: `User ${wire.user.fullName} has passed all checks. Please verify and approve final transfer.`,
                            type: "WARNING",
                            link: `/admin/wires?id=${wireId}`,
                            isRead: false
                        }))
                    });
                }

                return { success: true, message: "Verification Complete. Processing final authorization..." };

            } else {
                await db.wireTransfer.update({
                    where: { id: wireId },
                    data: { currentStage: nextStage }
                });

                revalidatePath(`/dashboard/wire/status?id=${wireId}`);
                return { success: true, message: "Code Accepted. Proceeding..." };
            }
        }
    } catch (err) {
        console.error("Clearance Error:", err);
        return { message: "System error. Please contact support." };
    }
}


// 'use server';

// import { auth } from "@/auth";
// import { db } from "@/lib/db";
// import { revalidatePath } from "next/cache";
// import { TransactionStatus } from "@prisma/client";

// export async function submitClearanceCode(prevState: any, formData: FormData) {
//     const session = await auth();
//     if (!session?.user?.id) return { message: "Unauthorized" };

//     const code = formData.get("code") as string;
//     const wireId = formData.get("wireId") as string;

//     const cleanCode = code ? code.trim().toUpperCase() : "";

//     if (!cleanCode || !wireId) return { message: "Invalid Request." };

//     const wire = await db.wireTransfer.findUnique({
//         where: { id: wireId, userId: session.user.id },
//         include: { user: { select: { fullName: true } } } // ✅ Fetch name for notification
//     });

//     if (!wire) return { message: "Transaction not found." };

//     // ✅ Strict Enum Check
//     const finalStatuses: TransactionStatus[] = [TransactionStatus.FAILED, TransactionStatus.COMPLETED];
//     if (finalStatuses.includes(wire.status)) {
//         return { message: `Transaction is already ${wire.status.toLowerCase()}.` };
//     }

//     // 2. DETERMINE REQUIRED CODE & NEXT STAGE
//     let requiredCode = "";
//     let nextStage = "";
//     let isFinalStage = false;

//     // 🔄 UPDATED FLOW: TAA -> COT -> IMF -> IJY -> DONE
//     if (wire.currentStage === 'TAA') {
//         requiredCode = wire.taaCode || "";
//         nextStage = 'COT';
//     } else if (wire.currentStage === 'COT') {
//         requiredCode = wire.cotCode || "";
//         nextStage = 'IMF';
//     } else if (wire.currentStage === 'IMF') {
//         requiredCode = wire.imfCode || "";
//         nextStage = 'IJY';
//     } else if (wire.currentStage === 'IJY') {
//         requiredCode = wire.ijyCode || "";
//         isFinalStage = true;
//     }

//     // 3. VERIFY CODE
//     const isCorrect = requiredCode && (cleanCode === requiredCode.trim().toUpperCase());

//     // 4. EXECUTE RESULT
//     try {
//         if (!isCorrect) {
//             // --- FAILURE PATH ---
//             const attempts = wire.failedAttempts + 1;

//             if (attempts >= 5) {
//                 await db.$transaction(async (tx) => {
//                     await tx.wireTransfer.update({
//                         where: { id: wireId },
//                         data: { status: TransactionStatus.FAILED, failedAttempts: attempts }
//                     });

//                     if (wire.accountId) {
//                         await tx.account.update({
//                             where: { id: wire.accountId },
//                             data: { availableBalance: { increment: wire.amount } }
//                         });

//                         // Fail Ledger
//                         const ledger = await tx.ledgerEntry.findFirst({
//                             where: { referenceId: { startsWith: 'WIRE' }, accountId: wire.accountId, status: TransactionStatus.PENDING }
//                         });
//                         if (ledger) {
//                             await tx.ledgerEntry.update({
//                                 where: { id: ledger.id },
//                                 data: { status: TransactionStatus.FAILED, description: `Wire Failed (Clearance Denied)` }
//                             });
//                         }
//                     }

//                     // 👇 NEW: NOTIFY ADMINS OF FRAUD ATTEMPT
//                     const admins = await tx.user.findMany({
//                         where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
//                         select: { id: true }
//                     });

//                     if (admins.length > 0) {
//                         await tx.notification.createMany({
//                             data: admins.map(admin => ({
//                                 userId: admin.id,
//                                 title: "Security Alert: Wire Blocked",
//                                 message: `User ${wire.user.fullName} failed clearance 5 times. Wire of $${wire.amount} cancelled.`,
//                                 type: "WARNING",
//                                 link: `/admin/wires?id=${wireId}`,
//                                 isRead: false
//                             }))
//                         });
//                     }
//                     // 👆 END NEW CODE
//                 });
//                 return { success: false, message: "❌ Security Limit Reached. Transaction Cancelled." };
//             }

//             await db.wireTransfer.update({
//                 where: { id: wireId },
//                 data: { failedAttempts: attempts }
//             });
//             return { success: false, message: `Invalid Code. ${5 - attempts} attempts remaining.` };
//         }

//         // --- SUCCESS PATH ---
//         await db.$transaction(async (tx) => {
//             if (isFinalStage) {
//                 // COMPLETE WIRE
//                 await tx.wireTransfer.update({
//                     where: { id: wireId },
//                     data: { currentStage: 'COMPLETED', status: TransactionStatus.COMPLETED }
//                 });

//                 if (wire.accountId) {
//                     await tx.account.update({
//                         where: { id: wire.accountId },
//                         data: { currentBalance: { decrement: wire.amount } }
//                     });

//                     const ledger = await tx.ledgerEntry.findFirst({
//                         where: { referenceId: { startsWith: 'WIRE' }, accountId: wire.accountId, status: TransactionStatus.PENDING }
//                     });
//                     if (ledger) {
//                         await tx.ledgerEntry.update({
//                             where: { id: ledger.id },
//                             data: { status: TransactionStatus.COMPLETED }
//                         });
//                     }
//                 }

//                 // 👇 NEW: NOTIFY ADMINS OF SUCCESSFUL WIRE
//                 const admins = await tx.user.findMany({
//                     where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
//                     select: { id: true }
//                 });

//                 if (admins.length > 0) {
//                     await tx.notification.createMany({
//                         data: admins.map(admin => ({
//                             userId: admin.id,
//                             title: "Wire Transfer Completed",
//                             message: `User ${wire.user.fullName} successfully completed transfer of $${wire.amount.toLocaleString()}.`,
//                             type: "SUCCESS",
//                             link: `/admin/wires?id=${wireId}`,
//                             isRead: false
//                         }))
//                     });
//                 }
//                 // 👆 END NEW CODE

//             } else {
//                 // MOVE TO NEXT STAGE
//                 await tx.wireTransfer.update({
//                     where: { id: wireId },
//                     data: { currentStage: nextStage }
//                 });
//             }
//         });

//     } catch (err) {
//         console.error("Clearance Error:", err);
//         return { message: "System error. Please try again." };
//     }

//     revalidatePath("/dashboard/wire/status");
//     revalidatePath(`/dashboard/wire/status?id=${wireId}`);
//     return { success: true, message: "Code Accepted. Verifying..." };
// }