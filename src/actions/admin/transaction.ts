'use server';

import { db } from "@/lib/db";
import { logAdminAction } from "@/lib/utils/admin-logger";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { canPerform } from "@/lib/auth/permissions";
import {
    TransactionDirection,
    TransactionStatus,
    TransactionType,
    UserRole
} from "@prisma/client";

// 1. DELETE TRANSACTION
export async function deleteTransaction(transactionId: string) {
    const { authorized, session } = await checkAdminAction();

    if (!authorized || !session || !session.user) {
        return { success: false, message: "Unauthorized" };
    }
    // permission Check (Support Agents cannot delete financial records.)
    if (!canPerform(session.user.role as UserRole, 'MONEY')) {
        return { success: false, message: "Insufficient permissions. Only Admins can delete transactions." };
    }

    try {
        await db.$transaction(async (tx) => {
            const record = await tx.ledgerEntry.findUnique({ where: { id: transactionId } });
            if (!record) throw new Error("Transaction not found");

            // REVERSE IMPACT (Only if it was completed)
            if (record.status === TransactionStatus.COMPLETED) {
                const op = record.direction === TransactionDirection.CREDIT
                    ? { decrement: record.amount }
                    : { increment: record.amount };

                await tx.account.update({
                    where: { id: record.accountId },
                    data: { availableBalance: op, currentBalance: op }
                });
            }

            await tx.ledgerEntry.delete({ where: { id: transactionId } });
        });

        await logAdminAction(
            "DELETE_TRX",
            transactionId,
            { admin: session.user.email },
            "WARNING",
            "SUCCESS"
        );

    } catch (err) {
        console.error("Delete Error:", err);
        return { success: false, message: "Failed to delete transaction." };
    }

    revalidatePath("/admin/users");
    return { success: true, message: "Transaction deleted & balance reverted." };
}

// 2. UPDATE TRANSACTION
export async function updateTransaction(prevState: any, formData: FormData) {
    const { authorized, session } = await checkAdminAction();

    if (!authorized || !session || !session.user) {
        return { success: false, message: "Unauthorized" };
    }

    // permission Check (Support Agents cannot edit financial records.)
    if (!canPerform(session.user.role as UserRole, 'MONEY')) {
        return { success: false, message: "Insufficient permissions. Only Admins can edit transactions." };
    }

    const transactionId = formData.get("transactionId") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const description = formData.get("description") as string;
    const createdAt = formData.get("createdAt") as string;
    const directionInput = formData.get("direction") as "CREDIT" | "DEBIT";
    const newDirection = directionInput === 'CREDIT' ? TransactionDirection.CREDIT : TransactionDirection.DEBIT;

    // Auto-fix the "type": If Credit -> DEPOSIT, If Debit -> WITHDRAWAL (Safe defaults)
    const newType = newDirection === TransactionDirection.CREDIT
        ? TransactionType.DEPOSIT
        : TransactionType.WITHDRAWAL;

    try {
        await db.$transaction(async (tx) => {
            // A. Fetch Original State
            const oldRecord = await tx.ledgerEntry.findUnique({ where: { id: transactionId } });
            if (!oldRecord) throw new Error("Transaction not found");

            // B. REVERT OLD BALANCE
            if (oldRecord.status === TransactionStatus.COMPLETED) {
                const reverseOp = oldRecord.direction === TransactionDirection.CREDIT
                    ? { decrement: oldRecord.amount }
                    : { increment: oldRecord.amount };

                await tx.account.update({
                    where: { id: oldRecord.accountId },
                    data: { availableBalance: reverseOp, currentBalance: reverseOp }
                });
            }

            // C. UPDATE THE RECORD
            const updatedRecord = await tx.ledgerEntry.update({
                where: { id: transactionId },
                data: {
                    amount,
                    description,
                    createdAt: new Date(createdAt), // Admin can backdate transactions
                    direction: newDirection,
                    type: newType
                }
            });

            // D. APPLY NEW BALANCE
            if (updatedRecord.status === TransactionStatus.COMPLETED) {
                const newOp = updatedRecord.direction === TransactionDirection.CREDIT
                    ? { increment: amount }
                    : { decrement: amount };

                await tx.account.update({
                    where: { id: updatedRecord.accountId },
                    data: { availableBalance: newOp, currentBalance: newOp }
                });
            }
        });

        await logAdminAction(
            "EDIT_TRX",
            transactionId,
            { amount, description, direction: newDirection, admin: session.user.email },
            "INFO",
            "SUCCESS"
        );

    } catch (err) {
        console.error("Update Error:", err);
        return { success: false, message: "Update failed." };
    }

    revalidatePath("/admin/users");
    return { success: true, message: "Transaction updated & balance synced." };
}