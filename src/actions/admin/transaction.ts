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
import { z } from "zod";
import { logSecurityEvent } from "@/lib/utils/security-logger";

const updateTransactionSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required"),
  amount: z.coerce.number().min(0.01, "Amount must be at least 0.01"),
  description: z.string().max(200, "Description must be 200 characters or less").optional(),
  createdAt: z.string().datetime({ message: "Invalid date/time format" }),
  direction: z.enum(["CREDIT", "DEBIT"], { message: "Direction must be CREDIT or DEBIT" }),
});

const sanitize = (str: string) => str.replace(/<[^>]*>/g, '');

export async function deleteTransaction(transactionId: string) {
    const { authorized, session } = await checkAdminAction();

    if (!authorized || !session || !session.user) {
        return { success: false, message: "Unauthorized" };
    }
    if (!canPerform(session.user.role as UserRole, 'MONEY')) {
        return { success: false, message: "Insufficient permissions. Only Admins can delete transactions." };
    }

    try {
        await db.$transaction(async (tx) => {
            const record = await tx.ledgerEntry.findUnique({ where: { id: transactionId } });
            if (!record) throw new Error("Transaction not found");

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

        await logSecurityEvent({
  action: "ADMIN_DELETE_TRANSACTION",
  level: "CRITICAL",
  details: {
    transactionId,
    adminEmail: session.user.email,
  },
  adminId: session.user.id,
});

    } catch (err) {
        console.error("Delete Error:", err);
        return { success: false, message: "Failed to delete transaction." };
    }

    revalidatePath("/admin/users");
    return { success: true, message: "Transaction deleted & balance reverted." };
}

export async function updateTransaction(prevState: any, formData: FormData) {
    const { authorized, session } = await checkAdminAction();

    if (!authorized || !session || !session.user) {
        return { success: false, message: "Unauthorized" };
    }

    if (!canPerform(session.user.role as UserRole, 'MONEY')) {
        return { success: false, message: "Insufficient permissions. Only Admins can edit transactions." };
    }

  const rawData = {
  transactionId: formData.get("transactionId") as string,
  amount: formData.get("amount") as string,
  description: formData.get("description") as string,
  createdAt: formData.get("createdAt") as string,
  direction: formData.get("direction") as string,
};

const validated = updateTransactionSchema.safeParse(rawData);
if (!validated.success) {
  return { success: false, message: validated.error.issues[0].message };
}

const { transactionId, amount, description: rawDescription, createdAt, direction } = validated.data;

const description = rawDescription ? sanitize(rawDescription) : undefined;

 const newDirection = direction === 'CREDIT' ? TransactionDirection.CREDIT : TransactionDirection.DEBIT;
const newType = newDirection === TransactionDirection.CREDIT
    ? TransactionType.DEPOSIT
    : TransactionType.WITHDRAWAL;

    try {
        await db.$transaction(async (tx) => {
            const oldRecord = await tx.ledgerEntry.findUnique({ where: { id: transactionId } });
            if (!oldRecord) throw new Error("Transaction not found");

            if (oldRecord.status === TransactionStatus.COMPLETED) {
                const reverseOp = oldRecord.direction === TransactionDirection.CREDIT
                    ? { decrement: oldRecord.amount }
                    : { increment: oldRecord.amount };

                await tx.account.update({
                    where: { id: oldRecord.accountId },
                    data: { availableBalance: reverseOp, currentBalance: reverseOp }
                });
            }

            const updatedRecord = await tx.ledgerEntry.update({
                where: { id: transactionId },
                data: {
                    amount,
                    description,
                    createdAt: new Date(createdAt),
                    direction: newDirection,
                    type: newType
                }
            });

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

        await logSecurityEvent({
  action: "ADMIN_UPDATE_TRANSACTION",
  level: "WARNING",
  details: {
    transactionId,
    amount,
    description,
    direction: newDirection,
    adminEmail: session.user.email,
  },
  adminId: session.user.id,
});

    } catch (err) {
        console.error("Update Error:", err);
        return { success: false, message: "Update failed." };
    }

    revalidatePath("/admin/users");
    return { success: true, message: "Transaction updated & balance synced." };
}