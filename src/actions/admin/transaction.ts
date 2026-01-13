'use server';

import { db } from "@/lib/db";
import { logAdminAction } from "@/lib/admin-logger";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/admin-auth";

// 1. DELETE TRANSACTION
export async function deleteTransaction(transactionId: string) {
    const { authorized } = await checkAdminAction();
    if (!authorized) return { success: false, message: "Unauthorized" };

    try {
        await db.$transaction(async (tx) => {
            const record = await tx.ledgerEntry.findUnique({ where: { id: transactionId } });
            if (!record) throw new Error("Transaction not found");

            // REVERSE IMPACT
            if (record.status === 'COMPLETED') {
                const op = record.direction === 'CREDIT' ? { decrement: record.amount } : { increment: record.amount };

                await tx.account.update({
                    where: { id: record.accountId },
                    data: { availableBalance: op, currentBalance: op }
                });
            }

            await tx.ledgerEntry.delete({ where: { id: transactionId } });
        });

        revalidatePath("/admin/users");
        return { success: true, message: "Transaction deleted & balance reverted." };
    } catch (err) {
        return { success: false, message: "Failed to delete." };
    }
}

// 2. UPDATE TRANSACTION (With Direction Swap Support)
export async function updateTransaction(prevState: any, formData: FormData) {
    const { authorized } = await checkAdminAction();
    if (!authorized) return { success: false, message: "Unauthorized" };

    const transactionId = formData.get("transactionId") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const description = formData.get("description") as string;
    const createdAt = formData.get("createdAt") as string;

    // 👇 NEW: Capture Direction Change
    const direction = formData.get("direction") as "CREDIT" | "DEBIT";

    // Auto-fix the "type" tag if direction changes (e.g. avoiding "WITHDRAWAL" tag on a CREDIT)
    const typeLabel = direction === 'CREDIT' ? 'DEPOSIT' : 'WITHDRAWAL';

    try {
        await db.$transaction(async (tx) => {
            // A. Fetch Original State
            const oldRecord = await tx.ledgerEntry.findUnique({ where: { id: transactionId } });
            if (!oldRecord) throw new Error("Transaction not found");

            // B. REVERT OLD BALANCE (Undo the past)
            if (oldRecord.status === 'COMPLETED') {
                const reverseOp = oldRecord.direction === 'CREDIT'
                    ? { decrement: oldRecord.amount } // Was Credit -> Remove it
                    : { increment: oldRecord.amount }; // Was Debit -> Add it back

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
                    createdAt: new Date(createdAt),
                    direction: direction, // 👈 Update Direction
                    type: typeLabel       // 👈 Update Type Label
                }
            });

            // D. APPLY NEW BALANCE (Apply the future)
            if (updatedRecord.status === 'COMPLETED') {
                const newOp = updatedRecord.direction === 'CREDIT'
                    ? { increment: amount } // Is Credit -> Add it
                    : { decrement: amount }; // Is Debit -> Remove it

                await tx.account.update({
                    where: { id: updatedRecord.accountId },
                    data: { availableBalance: newOp, currentBalance: newOp }
                });
            }
        });

        await logAdminAction("EDIT_TRX", transactionId, { amount, description, direction });
        revalidatePath("/admin/users");
        return { success: true, message: "Transaction updated & balance synced." };

    } catch (err) {
        console.error("Update Error:", err);
        return { success: false, message: "Update failed." };
    }
}