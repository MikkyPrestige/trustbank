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
        TransactionStatus.PENDING_AUTH,
        TransactionStatus.REVERSED
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
                    // 1. MARK AS REVERSED (System Block)
                    await tx.wireTransfer.update({
                        where: { id: wireId },
                        data: {
                            status: TransactionStatus.REVERSED,
                            failedAttempts: attempts
                        }
                    });

                    // 2. REFUND MONEY
                    const totalRelease = Number(wire.amount) + Number(wire.fee || 0);

                    if (wire.accountId) {
                        await tx.account.update({
                            where: { id: wire.accountId },
                            data: { availableBalance: { increment: totalRelease } }
                        });

                        // 3. MARK LEDGER AS REVERSED
                        await tx.ledgerEntry.updateMany({
                            where: {
                                referenceId: { contains: wire.id },
                                status: { in: [TransactionStatus.ON_HOLD, TransactionStatus.PENDING_AUTH] }
                            },
                            data: {
                                status: TransactionStatus.REVERSED,
                                description: `Security Block: Excessive Failed Codes`
                            }
                        });
                    }

                    // 4. NOTIFY ADMIN
                    const admins = await tx.user.findMany({
                        where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
                        select: { id: true }
                    });

                    if (admins.length > 0) {
                        await tx.notification.createMany({
                            data: admins.map(admin => ({
                                userId: admin.id,
                                title: "Security Alert: Wire Reversed",
                                message: `User ${wire.user.fullName} failed clearance 5 times. System auto-reversed the transaction.`,
                                type: "WARNING",
                                link: `/admin/wires?id=${wireId}`,
                                isRead: false
                            }))
                        });
                    }

                    // 5. NOTIFY USER (Optional but good UX)
                    await tx.notification.create({
                        data: {
                            userId: wire.userId,
                            title: "Transaction Blocked",
                            message: "Security Alert: Too many failed verification attempts. Your transaction has been reversed.",
                            type: "ERROR",
                            link: `/dashboard/wire/status?id=${wireId}`,
                            isRead: false
                        }
                    });
                });

                revalidatePath("/dashboard");
                return { success: false, message: "Security Limit Reached. Transaction Reversed." };

            } else {
                await db.wireTransfer.update({
                    where: { id: wireId },
                    data: { failedAttempts: attempts }
                });
                return { success: false, message: `Invalid Code. ${5 - attempts} attempts remaining.` };
            }

        } else {
            // --- SUCCESS FLOW (Unchanged) ---
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