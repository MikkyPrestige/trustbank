'use server';

import { db } from "@/lib/db";
import { logAdminAction } from "@/lib/utils/admin-logger";
import { canPerform } from "@/lib/auth/permissions";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import {
    TransactionStatus,
    UserRole,
    TransactionType,
    TransactionDirection,
    Prisma,
    UserStatus
} from "@prisma/client";

// GENERATE CODES
const generateCode = (prefix: string) => {
    return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
};

// 1. SET CLEARANCE CODE (Manual Entry)
export async function adminSetWireCode(formData: FormData) {
    const { authorized, session } = await checkAdminAction();
    if (!authorized || !session || !session.user) {
        return { success: false, message: "Unauthorized" };
    }

    if (!canPerform(session.user.role as UserRole, 'EDIT')) {
        return { success: false, message: "Insufficient permissions. Access Level: EDIT required." };
    }

    const wireId = formData.get("wireId") as string;
    const stage = formData.get("stage") as string;
    const code = formData.get("code") as string;

    if (!code) return { success: false, message: "Code is required" };

    try {
        // CHECK USER STATUS
        const existingWire = await db.wireTransfer.findUnique({
            where: { id: wireId },
            include: { user: true }
        });

        if (!existingWire) return { success: false, message: "Wire not found" };

        if (existingWire.user.status === UserStatus.ARCHIVED) {
            return { success: false, message: "Action Denied: User account is archived." };
        }
        if (existingWire.user.status === UserStatus.FROZEN) {
            return { success: false, message: "Action Denied: User account is frozen." };
        }

        const updateData: any = {};
        if (stage === 'TAA') updateData.taaCode = code;
        if (stage === 'COT') updateData.cotCode = code;
        if (stage === 'IMF') updateData.imfCode = code;
        if (stage === 'IJY') updateData.ijyCode = code;

        const updatedWire = await db.wireTransfer.update({
            where: { id: wireId },
            data: updateData
        });

        await db.notification.create({
            data: {
                userId: updatedWire.userId,
                title: "Clearance Code Updated",
                message: `The ${stage} clearance code for your pending transaction has been issued.`,
                type: "INFO",
                link: `/dashboard/wire/status?id=${wireId}`,
                isRead: false
            }
        });

        await logAdminAction(
            "UPDATE_WIRE_CODE",
            wireId,
            { stage, code, admin: session?.user?.email },
            "INFO",
            "SUCCESS"
        );

    } catch (error) {
        return { success: false, message: "Failed to update code" };
    }

    revalidatePath("/admin/wires");
    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return { success: true, message: `${stage} Code Updated!` };
}

// 2. REJECT & REFUND
export async function adminRejectWire(wireId: string) {
    const { authorized, session } = await checkAdminAction();
    if (!authorized || !session || !session.user) {
        return { success: false, message: "Unauthorized" };
    }

    if (!canPerform(session.user.role as UserRole, 'MONEY')) {
        return { success: false, message: "Security Alert: Only Admins can refund transactions." };
    }

    try {
        //  PRE-CHECK
        const checkWire = await db.wireTransfer.findUnique({
            where: { id: wireId },
            include: { user: true }
        });

        if (!checkWire) return { success: false, message: "Wire not found" };

        if (checkWire.user.status === UserStatus.ARCHIVED) {
            return { success: false, message: "Action Denied: User account is archived." };
        }

        const wire = await db.$transaction(async (tx: Prisma.TransactionClient) => {
            const w = await tx.wireTransfer.findUnique({ where: { id: wireId } });

            if (!w || w.status === TransactionStatus.COMPLETED) {
                throw new Error("Invalid wire status or already processed");
            }

            await tx.wireTransfer.update({
                where: { id: wireId },
                data: { status: TransactionStatus.FAILED }
            });

            if (w.accountId) {
                // Find Pending Debit
                const pendingLedger = await tx.ledgerEntry.findFirst({
                    where: {
                        referenceId: { contains: w.id },
                        accountId: w.accountId,
                        direction: TransactionDirection.DEBIT,
                        status: TransactionStatus.PENDING
                    }
                });

                // Deduct Current Balance to "Realize" the loss before refunding
                await tx.account.update({
                    where: { id: w.accountId },
                    data: { currentBalance: { decrement: w.amount } }
                });

                if (pendingLedger) {
                    await tx.ledgerEntry.update({
                        where: { id: pendingLedger.id },
                        data: {
                            status: TransactionStatus.COMPLETED,
                            description: `Wire Transfer (Rejected)`
                        }
                    });
                }

                // REFUND PRINCIPAL
                await tx.account.update({
                    where: { id: w.accountId },
                    data: {
                        availableBalance: { increment: w.amount },
                        currentBalance: { increment: w.amount }
                    }
                });

                await tx.ledgerEntry.create({
                    data: {
                        accountId: w.accountId,
                        amount: w.amount,
                        description: `Refund: Wire Principal`,
                        type: 'REFUND' as any,
                        direction: TransactionDirection.CREDIT,
                        status: TransactionStatus.COMPLETED,
                        referenceId: `REF-${w.id}`
                    }
                });

                // REFUND FEE
                const feeLedger = await tx.ledgerEntry.findFirst({
                    where: {
                        accountId: w.accountId,
                        type: 'FEE' as any,
                        status: TransactionStatus.COMPLETED,
                        createdAt: {
                            gte: new Date(w.createdAt.getTime() - 60000),
                            lte: new Date(w.createdAt.getTime() + 60000)
                        }
                    }
                });

                if (feeLedger) {
                    await tx.account.update({
                        where: { id: w.accountId },
                        data: {
                            availableBalance: { increment: feeLedger.amount },
                            currentBalance: { increment: feeLedger.amount }
                        }
                    });

                    await tx.ledgerEntry.create({
                        data: {
                            accountId: w.accountId,
                            amount: feeLedger.amount,
                            description: `Refund: Service Fee`,
                            type: 'REFUND' as any,
                            direction: TransactionDirection.CREDIT,
                            status: TransactionStatus.COMPLETED,
                            referenceId: `REF-FEE-${w.id}`
                        }
                    });
                }
            }

            await tx.notification.create({
                data: {
                    userId: w.userId,
                    title: "Transaction Refunded",
                    message: `Your wire transfer of $${Number(w.amount).toLocaleString()} has been rejected and fully refunded.`,
                    type: "ERROR",
                    link: "/dashboard",
                    isRead: false
                }
            });

            return w;
        });

        await logAdminAction(
            "REJECT_WIRE",
            wireId,
            { reason: "Admin rejected", admin: session?.user?.email },
            "WARNING",
            "SUCCESS"
        );

    } catch (error) {
        console.error("Refund Error:", error);
        return { success: false, message: "Refund Failed: " + (error as Error).message };
    }

    revalidatePath("/admin/wires");
    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return { success: true, message: "Wire Refunded Successfully" };
}

// 3. COMPLETE WIRE
export async function adminCompleteWire(input: string | FormData) {
    const { authorized, session } = await checkAdminAction();
    if (!authorized || !session || !session.user) {
        return { success: false, message: "Unauthorized" };
    }

    if (!canPerform(session.user.role as UserRole, 'MONEY')) {
        return { success: false, message: "Security Alert: Only Admins can finalize transactions." };
    }

    let wireId: string;
    if (input instanceof FormData) {
        wireId = input.get("wireId") as string;
    } else {
        wireId = input;
    }

    if (!wireId || typeof wireId !== "string") {
        return { success: false, message: "Invalid Wire ID." };
    }

    try {
        // PRE-CHECK USER STATUS
        const checkWire = await db.wireTransfer.findUnique({
            where: { id: wireId },
            include: { user: true }
        });

        if (!checkWire) return { success: false, message: "Wire not found" };

        if (checkWire.user.status === UserStatus.ARCHIVED) {
            return { success: false, message: "Action Denied: User account is archived." };
        }
        if (checkWire.user.status === UserStatus.FROZEN) {
            return { success: false, message: "Action Denied: User account is frozen." };
        }

        const wire = await db.$transaction(async (tx: Prisma.TransactionClient) => {
            const w = await tx.wireTransfer.findUnique({ where: { id: wireId } });

            if (!w) throw new Error("Wire not found.");
            if (w.status === TransactionStatus.COMPLETED) throw new Error("Wire is already finalized.");

            await tx.wireTransfer.update({
                where: { id: wireId },
                data: {
                    status: TransactionStatus.COMPLETED,
                    currentStage: 'COMPLETED'
                }
            });

            if (w.accountId) {
                const feeAmount = w.fee ? Number(w.fee) : 0;
                const totalDeduction = Number(w.amount) + feeAmount;

                await tx.account.update({
                    where: { id: w.accountId },
                    data: { currentBalance: { decrement: totalDeduction } }
                });

                const updateResult = await tx.ledgerEntry.updateMany({
                    where: {
                        referenceId: { contains: w.id },
                        status: TransactionStatus.ON_HOLD
                    },
                    data: {
                        status: TransactionStatus.COMPLETED,
                        description: `Wire Transfer to ${w.bankName}`
                    }
                });

                if (updateResult.count === 0) {
                     await tx.ledgerEntry.create({
                        data: {
                            accountId: w.accountId,
                            amount: w.amount,
                            description: `Wire Transfer to ${w.bankName}`,
                            type: TransactionType.WIRE,
                            direction: TransactionDirection.DEBIT,
                            status: TransactionStatus.COMPLETED,
                            referenceId: `WIRE-${w.id}`
                        }
                    });
                }

                if (feeAmount > 0) {
                    await tx.ledgerEntry.create({
                        data: {
                            accountId: w.accountId,
                            amount: feeAmount,
                            description: "Service Fee: Wire Transfer",
                            type: TransactionType.FEE,
                            direction: TransactionDirection.DEBIT,
                            status: TransactionStatus.COMPLETED,
                            referenceId: `FEE-${w.id}`
                        }
                    });
                }
            }

            await tx.notification.create({
                data: {
                    userId: w.userId,
                    title: "Transfer Successful",
                    message: `Your wire transfer of $${Number(w.amount).toLocaleString()} has been successfully sent.`,
                    type: "SUCCESS",
                    link: `/dashboard/wire/status?id=${wireId}`,
                    isRead: false
                }
            });

            return w;
        });

        await logAdminAction(
            "APPROVE_WIRE",
            wireId,
            { status: "COMPLETED", admin: session?.user?.email },
            "INFO",
            "SUCCESS"
        );

    } catch (error: any) {
        console.error("Completion Error:", error);
        return { success: false, message: error.message || "Failed to complete wire" };
    }

    revalidatePath("/admin/wires");
    return { success: true, message: "Wire Settled Successfully" };
}

// 4. GENERATE CLEARANCE CODES
export async function generateClearanceCodes(wireId: string) {
    const { authorized, session } = await checkAdminAction();
    if (!authorized || !session || !session.user) {
        return { success: false, message: "Unauthorized" };
    }

    if (!canPerform(session.user.role as UserRole, 'EDIT')) {
        return { message: "Insufficient permissions." };
    }

    // CHECK USER STATUS
    const wire = await db.wireTransfer.findUnique({
        where: { id: wireId },
        include: { user: true }
    });

    if (!wire) return { message: "Wire not found" };

    if (wire.user.status === UserStatus.ARCHIVED) {
        return { message: "Action Denied: User is archived." };
    }

    const taa = generateCode("TAA");
    const cot = generateCode("COT");
    const imf = generateCode("IMF");
    const ijy = generateCode("IJY");

    await db.wireTransfer.update({
        where: { id: wireId },
        data: {
            taaCode: taa,
            cotCode: cot,
            imfCode: imf,
            ijyCode: ijy,
        }
    });

    await logAdminAction(
        "GENERATE_CODES",
        wireId,
        { taa, cot, imf, ijy, admin: session?.user?.email },
        "INFO",
        "SUCCESS"
    );

    revalidatePath("/admin");
    revalidatePath("/admin/users");

    return {
        message: "Codes Generated",
        codes: { taa, cot, imf, ijy }
    };
}