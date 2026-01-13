'use server';

import { db } from "@/lib/db";
import { logAdminAction } from "@/lib/admin-logger";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/admin-auth";

export async function adjustUserBalance(
    accountId: string,
    amount: number,
    type: 'CREDIT' | 'DEBIT',
    description: string
) {
    const { authorized } = await checkAdminAction();
    if (!authorized) return { success: false, message: "Unauthorized access" };

    if (!amount || amount <= 0) return { success: false, message: "Invalid amount" };

    // 👇 GENERIC DEFAULTS
    const finalDescription = description?.trim()
        ? description
        : (type === 'CREDIT' ? "Bank Deposit" : "Bank Withdrawal");

    try {
        await db.$transaction(async (tx) => {
            await tx.account.update({
                where: { id: accountId },
                data: {
                    availableBalance: type === 'CREDIT' ? { increment: amount } : { decrement: amount },
                    currentBalance: type === 'CREDIT' ? { increment: amount } : { decrement: amount }
                }
            });

            await tx.ledgerEntry.create({
                data: {
                    accountId: accountId,
                    amount: amount,
                    direction: type,
                    description: finalDescription,
                    status: "COMPLETED",
                    referenceId: "TRX-" + Math.floor(Math.random() * 10000000), // Random TRX ID
                    type: type === 'CREDIT' ? "DEPOSIT" : "WITHDRAWAL"
                }
            });
        });

        await logAdminAction(
            type === 'CREDIT' ? "MANUAL_CREDIT" : "MANUAL_DEBIT",
            accountId,
            { amount, reason: finalDescription }
        );

        revalidatePath("/admin/users");
        revalidatePath(`/admin/users/[id]`, "page");

        return { success: true, message: "Balance updated successfully." };

    } catch (err) {
        console.error("❌ Funding Error:", err);
        return { success: false, message: "Transaction failed." };
    }
}