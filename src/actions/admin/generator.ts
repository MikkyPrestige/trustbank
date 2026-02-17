'use server';

import { db } from "@/lib/db";
import { logAdminAction } from "@/lib/utils/admin-logger";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { canPerform } from "@/lib/auth/permissions";
import {
    TransactionStatus,
    TransactionType,
    TransactionDirection,
    UserRole
} from "@prisma/client";

const DESCRIPTIONS = {
    CREDIT: [
        "Payroll Deposit - Tech Corp", "Wire Transfer", "Dividend Payout",
        "Tax Refund", "Military Bonus", "Cash Deposit - ATM", "Investment Return"
    ],
    DEBIT: [
        "Starbucks Coffee", "Uber Ride", "Netflix Subscription", "Walmart Grocery",
        "Amazon Purchase", "Shell Gas Station", "Apple Services", "Rent Payment",
        "Restaurant Bill", "Gym Membership", "Miscellaneous", "Charity", "Donation"
    ]
};

// PERMISSION: 'MONEY' (Strictly Admin Only)
export async function generateTransactions(prevState: any, formData: FormData) {
    const { authorized, session } = await checkAdminAction();

    if (!authorized || !session || !session.user) {
        return { message: "Unauthorized" };
    }

    if (!canPerform(session.user.role as UserRole, 'MONEY')) {
        return { message: "Insufficient permissions. Only Admins can generate transactions." };
    }

    const accountId = formData.get("accountId") as string;
    const type = formData.get("type") as 'CREDIT' | 'DEBIT' | 'MIXED';

    // This is the USD Amount (already converted by client)
    const totalAmount = parseFloat(formData.get("totalAmount") as string);

    // These are for display/notification purposes
    const displayAmount = parseFloat(formData.get("displayAmount") as string);
    const displayCurrency = formData.get("displayCurrency") as string;

    const count = parseInt(formData.get("count") as string);
    const customNote = formData.get("customNote") as string;

    const startStr = formData.get("startDate") as string;
    const endStr = formData.get("endDate") as string;
    const startDate = startStr ? new Date(startStr) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = endStr ? new Date(endStr) : new Date();

    if (!accountId || isNaN(totalAmount) || isNaN(count)) {
        return { message: "Invalid inputs" };
    }

    // SAFETY CHECK: Prevent Negative Balance on DEBIT
    if (type === 'DEBIT') {
        const account = await db.account.findUnique({ where: { id: accountId } });
        if (!account) return { message: "Account not found" };
        if (Number(account.availableBalance) < totalAmount) {
            return { message: `Impossible. Account only has $${Number(account.availableBalance).toLocaleString()}.` };
        }
    }

    // EXECUTE GENERATOR
    let userIdForNotification = "";

    try {
        const transactions: any[] = [];

        // THE MATH LOGIC
        if (type === 'MIXED') {
            const debitCount = Math.floor(count * 0.3) || 1;
            const creditCount = count - debitCount;
            let totalDebitVal = 0;

            // A. Generate Random Debits
            for (let i = 0; i < debitCount; i++) {
                const val = Math.floor(Math.random() * 500) + 10;
                totalDebitVal += val;
                transactions.push({
                    amount: val,
                    type: TransactionType.WITHDRAWAL,
                    direction: TransactionDirection.DEBIT
                });
            }

            // B. Calculate Required Credit to hit Target
            const requiredCreditVal = totalAmount + totalDebitVal;
            const creditDistrib = distributeAmount(requiredCreditVal, creditCount);

            creditDistrib.forEach(val => {
                transactions.push({
                    amount: val,
                    type: TransactionType.DEPOSIT,
                    direction: TransactionDirection.CREDIT
                });
            });

        } else {
            // SIMPLE MODE (All Credit or All Debit)
            const amounts = distributeAmount(totalAmount, count);
            const dir = type === 'CREDIT' ? TransactionDirection.CREDIT : TransactionDirection.DEBIT;
            const trxType = type === 'CREDIT' ? TransactionType.DEPOSIT : TransactionType.WITHDRAWAL;

            amounts.forEach(val => {
                transactions.push({ amount: val, type: trxType, direction: dir });
            });
        }

        // SHUFFLE, DATE & DESCRIBE
        const finalOps = transactions
            .map(t => ({ ...t, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(t => {
                const time = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());

                // Description Logic
                let desc;
                if (customNote && customNote.trim() !== "") {
                    desc = customNote;
                } else {
                    const descList = t.direction === TransactionDirection.CREDIT ? DESCRIPTIONS.CREDIT : DESCRIPTIONS.DEBIT;
                    desc = descList[Math.floor(Math.random() * descList.length)];
                }

                return {
                    accountId,
                    amount: t.amount,
                    type: t.type,
                    direction: t.direction,
                    description: desc,
                    status: TransactionStatus.COMPLETED,
                    referenceId: `GEN-${Math.floor(Math.random() * 1000000)}`,
                    createdAt: new Date(time),
                };
            });

        // DATABASE INSERT (Transaction)
        await db.$transaction(async (tx) => {
            //  Get User ID for notification
            const account = await tx.account.findUnique({ where: { id: accountId } });
            if (account) userIdForNotification = account.userId;

            //  Insert Transactions
            await tx.ledgerEntry.createMany({
                data: finalOps
            });

            //  Update Account Balance
            const netChange = type === 'DEBIT' ? -totalAmount : totalAmount;

            await tx.account.update({
                where: { id: accountId },
                data: {
                    availableBalance: { increment: netChange },
                    currentBalance: { increment: netChange }
                }
            });
        });

        // LOGGING & NOTIFICATION
        const formattedAmount = (displayAmount && displayCurrency)
            ? `${displayCurrency} ${displayAmount.toLocaleString()}`
            : `$${totalAmount.toLocaleString()}`;

        if (userIdForNotification) {
            await db.notification.create({
                data: {
                    userId: userIdForNotification,
                    title: "Account Activity Update",
                    message: `Your account history has been updated with ${count} new transactions. Net change: ${formattedAmount}.`,
                    type: "INFO",
                    link: "/dashboard",
                    isRead: false
                }
            });
        }

        await logAdminAction(
            "GENERATE_TRX",
            accountId,
            {
                amount: formattedAmount,
                count,
                type,
                note: customNote,
                admin: session.user.email
            },
            "INFO",
            "SUCCESS"
        );

    } catch (err) {
        console.error(err);
        return { message: "Generator failed." };
    }

    // REVALIDATE
    revalidatePath("/admin/users");

    return { success: true, message: `Successfully generated ${count} transactions.` };
}

// HELPER
function distributeAmount(total: number, parts: number): number[] {
    if (parts <= 1) return [Number(total.toFixed(2))];
    let remainder = total;
    const result = [];
    for (let i = 0; i < parts - 1; i++) {
        const max = (remainder / (parts - i)) * 1.5;
        const val = Math.floor(Math.random() * max) + 1;
        result.push(val);
        remainder -= val;
    }
    result.push(Number(remainder.toFixed(2)));
    return result;
}
