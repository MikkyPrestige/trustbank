'use server';

import { db } from "@/lib/db";
import { logAdminAction } from "@/lib/admin-logger";
import { revalidatePath } from "next/cache";
import { TransactionStatus, TransactionType } from "@prisma/client";
import { checkAdminAction } from "@/lib/admin-auth";

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

export async function generateTransactions(prevState: any, formData: FormData) {
    const { authorized } = await checkAdminAction();
    if (!authorized) return { message: "Unauthorized" };

    const accountId = formData.get("accountId") as string;
    const type = formData.get("type") as 'CREDIT' | 'DEBIT' | 'MIXED';
    const totalAmount = parseFloat(formData.get("totalAmount") as string);
    const count = parseInt(formData.get("count") as string);
    const customNote = formData.get("customNote") as string;

    const startStr = formData.get("startDate") as string;
    const endStr = formData.get("endDate") as string;
    const startDate = startStr ? new Date(startStr) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = endStr ? new Date(endStr) : new Date();

    if (!accountId || isNaN(totalAmount) || isNaN(count)) {
        return { message: "Invalid inputs" };
    }

    try {
        const transactions: any[] = [];

        // 🧠 THE MATH LOGIC
        if (type === 'MIXED') {
            const debitCount = Math.floor(count * 0.3) || 1;
            const creditCount = count - debitCount;
            let totalDebitVal = 0;

            // A. Generate Random Debits
            for (let i = 0; i < debitCount; i++) {
                const val = Math.floor(Math.random() * 500) + 10;
                totalDebitVal += val;
                transactions.push({ amount: val, type: 'WITHDRAWAL', direction: 'DEBIT' });
            }

            // B. Calculate Required Credit
            const requiredCreditVal = totalAmount + totalDebitVal;
            const creditDistrib = distributeAmount(requiredCreditVal, creditCount);
            creditDistrib.forEach(val => {
                transactions.push({ amount: val, type: 'DEPOSIT', direction: 'CREDIT' });
            });

        } else {
            // SIMPLE MODE
            const amounts = distributeAmount(totalAmount, count);
            const dir = type === 'CREDIT' ? 'CREDIT' : 'DEBIT';
            const trxType = type === 'CREDIT' ? 'DEPOSIT' : 'WITHDRAWAL';

            amounts.forEach(val => {
                transactions.push({ amount: val, type: trxType, direction: dir });
            });
        }

        // 🎲 SHUFFLE, DATE & DESCRIBE
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
                    const descList = t.direction === 'CREDIT' ? DESCRIPTIONS.CREDIT : DESCRIPTIONS.DEBIT;
                    desc = descList[Math.floor(Math.random() * descList.length)];
                }

                return {
                    accountId,
                    amount: t.amount,
                    type: t.type as TransactionType,
                    direction: t.direction as string,
                    description: desc,
                    status: TransactionStatus.COMPLETED,
                    referenceId: `GEN-${Math.floor(Math.random() * 1000000)}`,
                    createdAt: new Date(time)
                };
            });

        // 💾 DATABASE INSERT
        await db.$transaction(async (tx) => {
            // 1. Insert Transactions
            await tx.ledgerEntry.createMany({
                data: finalOps
            });

            // 2. Update Account Balance (Both Available & Current)
            const netChange = type === 'DEBIT' ? -totalAmount : totalAmount;

            await tx.account.update({
                where: { id: accountId },
                data: {
                    availableBalance: { increment: netChange },
                    currentBalance: { increment: netChange }
                }
            });
        });

        await logAdminAction("GENERATE_TRX", accountId, { amount: totalAmount, count, type, note: customNote });

        revalidatePath("/admin/users");
        return { success: true, message: `Successfully generated ${count} transactions.` };

    } catch (err) {
        console.error(err);
        return { message: "Generator failed." };
    }
}

// 🧮 HELPER
function distributeAmount(total: number, parts: number): number[] {
    if (parts === 1) return [total];
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