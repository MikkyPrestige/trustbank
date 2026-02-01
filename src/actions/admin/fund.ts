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

export async function adjustUserBalance(
    accountId: string,
    amount: number,
    type: 'CREDIT' | 'DEBIT',
    description: string
) {
    const { authorized, session } = await checkAdminAction();

    if (!authorized || !session || !session.user || !session.user.email) {
        return { success: false, message: "Unauthorized access" };
    }

    if (!canPerform(session.user.role as UserRole, 'MONEY')) {
        return { success: false, message: "Insufficient permissions. Only Admins can adjust balances." };
    }

    const adminUser = session.user;

    if (!amount || amount <= 0) return { success: false, message: "Invalid amount" };

    const finalDescription = description?.trim()
        ? description
        : (type === 'CREDIT' ? "Bank Deposit" : "Bank Withdrawal");

    // 1. SAFETY CHECK (Read-before-write)
    if (type === 'DEBIT') {
        const account = await db.account.findUnique({ where: { id: accountId } });
        if (!account) return { success: false, message: "Account not found" };

        if (Number(account.availableBalance) < amount) {
            return {
                success: false,
                message: `Insufficient Funds. User only has $${Number(account.availableBalance).toLocaleString()}.`
            };
        }
    }

    // 2. EXECUTE TRANSACTION
    let userIdForNotification = "";
    let finalBalance = 0;

    try {
        await db.$transaction(async (tx) => {
            const account = await tx.account.findUnique({ where: { id: accountId }, include: { user: true } });
            if (!account) throw new Error("Account not found");

            userIdForNotification = account.userId;

            const currentBal = Number(account.currentBalance);
            const newBal = type === 'CREDIT' ? currentBal + amount : currentBal - amount;

            if (type === 'DEBIT' && newBal < 0) {
                throw new Error("Insufficient funds during processing.");
            }

            // set finalBalance for logging after transaction
            finalBalance = newBal;

            // Update Account
            await tx.account.update({
                where: { id: accountId },
                data: {
                    availableBalance: type === 'CREDIT' ? { increment: amount } : { decrement: amount },
                    currentBalance: type === 'CREDIT' ? { increment: amount } : { decrement: amount }
                }
            });

            // Create Ledger Entry
            await tx.ledgerEntry.create({
                data: {
                    accountId: accountId,
                    amount: amount,
                    balanceAfter: newBal,
                    direction: type === 'CREDIT' ? TransactionDirection.CREDIT : TransactionDirection.DEBIT,
                    type: type === 'CREDIT' ? TransactionType.DEPOSIT : TransactionType.WITHDRAWAL,
                    status: TransactionStatus.COMPLETED,
                    description: finalDescription,
                    referenceId: "ADM-" + Math.floor(Math.random() * 10000000),
                    metadata: JSON.stringify({ adminId: adminUser.id })
                }
            });
        });

        // 3. NOTIFICATION & LOGS
        if (userIdForNotification) {
            await db.notification.create({
                data: {
                    userId: userIdForNotification,
                    title: type === 'CREDIT' ? "Funds Credited" : "Funds Debited",
                    message: type === 'CREDIT'
                        ? `Your account was credited with $${amount.toLocaleString()}. Ref: ${finalDescription}`
                        : `Your account was debited by $${amount.toLocaleString()}. Ref: ${finalDescription}`,
                    type: type === 'CREDIT' ? "SUCCESS" : "WARNING",
                    link: "/dashboard",
                    isRead: false
                }
            });
        }

        // 4. LOG ACTION
        await logAdminAction(
            type === 'CREDIT' ? "MANUAL_CREDIT" : "MANUAL_DEBIT",
            accountId,
            {
                amount,
                reason: finalDescription,
                adminEmail: adminUser.email,
                balanceAfter: finalBalance
            },
            "INFO",
            "SUCCESS"
        );

    } catch (err: any) {
        console.error("Funding Error:", err);

        // Log Failure
        await logAdminAction(
            type === 'CREDIT' ? "MANUAL_CREDIT" : "MANUAL_DEBIT",
            accountId,
            { error: err.message, amount },
            "WARNING",
            "FAILED"
        );

        return { success: false, message: err.message || "Transaction failed." };
    }

    // 5. REVALIDATE
    try {
        revalidatePath("/admin/users");
        revalidatePath(`/admin/users/${accountId}`);
    } catch (e) {
        console.warn("Revalidation warning:", e);
    }

    return { success: true, message: "Balance updated successfully." };
}