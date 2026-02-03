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