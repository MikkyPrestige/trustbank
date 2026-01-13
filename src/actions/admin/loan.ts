'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/admin-logger";

export async function processLoan(loanId: string, decision: 'APPROVED' | 'REJECTED') {
    // 1. Security Check (One-liner)
    const { authorized } = await checkAdminAction();
    if (!authorized) return { message: "Unauthorized" };

    try {
        const loan = await db.loan.findUnique({ where: { id: loanId }, include: { user: true } });
        if (!loan || loan.status !== 'PENDING') return { message: "Loan not valid or already processed" };

        // --- HANDLE REJECTION ---
        if (decision === 'REJECTED') {
            await db.loan.update({
                where: { id: loanId },
                data: { status: 'REJECTED' }
            });

            await logAdminAction("REJECT_LOAN", loanId, { amount: loan.amount, reason: "Admin decision" });
            revalidatePath("/admin/loans");
            return { message: "Loan Rejected" };
        }

        // --- HANDLE APPROVAL (DISBURSE FUNDS) ---
        await db.$transaction(async (tx) => {
            // A. Update Loan Status
            await tx.loan.update({
                where: { id: loanId },
                data: {
                    status: 'APPROVED',
                    approvedAt: new Date()
                }
            });

            // B. Find User's Primary Account
            const account = await tx.account.findFirst({
                where: { userId: loan.userId },
                orderBy: { isPrimary: 'desc' } // Prioritize Primary account
            });

            if (!account) throw new Error("User has no account to credit");

            // C. Credit the Account (Update BOTH balances)
            await tx.account.update({
                where: { id: account.id },
                data: {
                    availableBalance: { increment: loan.amount },
                    currentBalance: { increment: loan.amount } // 👈 Syncs the balances
                }
            });

            // D. Create Ledger Entry
            await tx.ledgerEntry.create({
                data: {
                    accountId: account.id,
                    amount: loan.amount,
                    type: 'DEPOSIT',
                    direction: 'CREDIT',
                    status: 'COMPLETED',
                    description: `Loan Disbursement: ${loan.reason}`,
                    referenceId: `LOAN-${loan.id.slice(-8)}`
                }
            });
        });

        await logAdminAction("APPROVE_LOAN", loanId, { amount: loan.amount });
        revalidatePath("/admin/loans");
        return { success: true, message: "Funds Disbursed Successfully" };

    } catch (error) {
        console.error("Loan Error:", error);
        return { message: "System Error processing loan" };
    }
}