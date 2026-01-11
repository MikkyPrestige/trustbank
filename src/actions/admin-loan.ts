'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function processLoan(loanId: string, decision: 'APPROVED' | 'REJECTED') {
  const session = await auth();

  // 1. Security Check
  const admin = await db.user.findUnique({ where: { id: session?.user?.id } });
  if (!admin || admin.role !== 'ADMIN') {
    return { message: "Unauthorized" };
  }

  try {
    const loan = await db.loan.findUnique({ where: { id: loanId }, include: { user: true } });
    if (!loan || loan.status !== 'PENDING') return { message: "Loan not valid" };

    if (decision === 'REJECTED') {
        await db.loan.update({
            where: { id: loanId },
            data: { status: 'REJECTED' }
        });
        revalidatePath("/admin/loans");
        return { message: "Loan Rejected" };
    }

    // DECISION IS APPROVED -> DISBURSE FUNDS
    await db.$transaction(async (tx) => {
        // A. Update Loan Status
        await tx.loan.update({
            where: { id: loanId },
            data: {
                status: 'APPROVED',
                approvedAt: new Date() // Ensure this field exists in your schema!
            }
        });

        // B. Find User's Primary Account (Savings or Checking)
        const account = await tx.account.findFirst({
            where: { userId: loan.userId },
            orderBy: { isPrimary: 'desc' } // Prioritize Primary account
        });

        if (!account) throw new Error("User has no account to credit");

        // C. Credit the Account
        await tx.account.update({
            where: { id: account.id },
            data: { availableBalance: { increment: loan.amount } }
        });

        // D. Create Ledger Entry (The "Receipt")
        await tx.ledgerEntry.create({
            data: {
                accountId: account.id,
                amount: loan.amount,
                type: 'DEPOSIT', // Using standard type for consistency
                direction: 'CREDIT',
                status: 'COMPLETED',
                description: `Loan Disbursement: ${loan.reason}`,
                referenceId: `LOAN-${loan.id.slice(-8)}`
            }
        });
    });

    revalidatePath("/admin/loans");
    return { success: true, message: "Funds Disbursed Successfully" };

  } catch (error) {
    console.error(error);
    return { message: "System Error processing loan" };
  }
}