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

const sanitize = (str: string) => str.replace(/<[^>]*>/g, '');

const adjustSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  type: z.enum(['CREDIT', 'DEBIT'], { message: "Invalid adjustment type" }),
  description: z.string().max(200).optional(),
  displayAmount: z.coerce.number().optional(),
  displayCurrency: z.string().max(10).optional(),
});

export async function adjustUserBalance(
    accountId: string,
    amount: number,
    type: 'CREDIT' | 'DEBIT',
    description: string,
    displayAmount?: number,
    displayCurrency?: string
) {
    const { authorized, session } = await checkAdminAction();

    if (!authorized || !session || !session.user || !session.user.email) {
        return { success: false, message: "Unauthorized access" };
    }

    if (!canPerform(session.user.role as UserRole, 'MONEY')) {
        return { success: false, message: "Insufficient permissions." };
    }

    const adminUser = session.user;

    const validated = adjustSchema.safeParse({
  accountId, amount, type, description, displayAmount, displayCurrency
});

if (!validated.success) {
  return { success: false, message: validated.error.issues[0].message };
}

const { accountId: safeAccountId, amount: safeAmount, type: safeType, description: rawDescription, displayAmount: dispAmount, displayCurrency: dispCurrency } = validated.data;

const safeDescription = sanitize(rawDescription?.trim() || (safeType === 'CREDIT' ? "Bank Deposit" : "Bank Withdrawal"));

   const formattedMoney = (dispAmount && dispCurrency)
  ? `${dispCurrency} ${dispAmount.toLocaleString()}`
  : `$${safeAmount.toLocaleString()}`;

    if (safeType === 'DEBIT') {
        const account = await db.account.findUnique({ where: { id: safeAccountId } });
        if (!account) return { success: false, message: "Account not found" };

        if (Number(account.availableBalance) < safeAmount) {
            return {
                success: false,
                message: `Insufficient Funds. User only has $${Number(account.availableBalance).toLocaleString()}.`
            };
        }
    }

    let userIdForNotification = "";
    let finalBalance = 0;

    try {
        await db.$transaction(async (tx) => {
            const account = await tx.account.findUnique({ where: { id: safeAccountId }, include: { user: true } });
            if (!account) throw new Error("Account not found");

            userIdForNotification = account.userId;

            const currentBal = Number(account.currentBalance);
            const newBal = safeType === 'CREDIT' ? currentBal + safeAmount : currentBal - safeAmount;

            if (safeType === 'DEBIT' && newBal < 0) {
                throw new Error("Insufficient funds during processing.");
            }

            finalBalance = newBal;

            await tx.account.update({
                where: { id: safeAccountId },
                data: {
                    availableBalance: safeType === 'CREDIT' ? { increment: safeAmount } : { decrement: safeAmount },
                    currentBalance: safeType === 'CREDIT' ? { increment: safeAmount } : { decrement: safeAmount }
                }
            });

            await tx.ledgerEntry.create({
                data: {
                    accountId: safeAccountId,
                    amount: safeAmount,
                    balanceAfter: newBal,
                    direction: safeType === 'CREDIT' ? TransactionDirection.CREDIT : TransactionDirection.DEBIT,
                    type: safeType === 'CREDIT' ? TransactionType.DEPOSIT : TransactionType.WITHDRAWAL,
                    status: TransactionStatus.COMPLETED,
                    description: safeDescription,
                    referenceId: "ADM-" + Math.floor(Math.random() * 10000000),
                    metadata: JSON.stringify({
                        adminId: adminUser.id,
                        originalCurrency: dispCurrency,
                        originalAmount: dispAmount
                    })
                }
            });
        });

        if (userIdForNotification) {
            await db.notification.create({
                data: {
                    userId: userIdForNotification,
                    title: safeType === 'CREDIT' ? "Funds Credited" : "Funds Debited",
                    message: safeType === 'CREDIT'
                        ? `Your account was credited with ${formattedMoney}. Ref: ${safeDescription}`
                        : `Your account was debited by ${formattedMoney}. Ref: ${safeDescription}`,
                    type: safeType === 'CREDIT' ? "SUCCESS" : "WARNING",
                    link: "/dashboard",
                    isRead: false
                }
            });
        }

        await logAdminAction(
            safeType === 'CREDIT' ? "MANUAL_CREDIT" : "MANUAL_DEBIT",
            safeAccountId,
            {
                amount: formattedMoney,
                usdAmount: safeAmount,
                reason: safeDescription,
                adminEmail: adminUser.email,
                balanceAfter: finalBalance
            },
            "INFO",
            "SUCCESS"
        );

        await logSecurityEvent({
  action: safeType === 'CREDIT' ? "ADMIN_MANUAL_CREDIT" : "ADMIN_MANUAL_DEBIT",
  level: "CRITICAL",
  details: {
    accountId: safeAccountId,
    amount: safeAmount,
    type: safeType,
    description: safeDescription,
    adminEmail: adminUser.email,
    balanceAfter: finalBalance,
  },
  adminId: adminUser.id,
  userId: userIdForNotification || undefined,
});

    } catch (err: any) {
        console.error("Funding Error:", err);
        return { success: false, message: err.message || "Transaction failed." };
    }

    try {
        revalidatePath("/admin/users");
        revalidatePath(`/admin/users/${safeAccountId}`);
    } catch (e) {}

    return { success: true, message: "Balance updated successfully." };
}