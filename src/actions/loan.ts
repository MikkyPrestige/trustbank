'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { checkPermissions } from "@/lib/security";
import { revalidatePath } from "next/cache";

export async function applyForLoan(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { message: "Unauthorized" };

  const permission = await checkPermissions(session.user.id, 'LOAN');
    if (!permission.allowed) {
        return { message: `🚫 ${permission.error}` };
    }

  const amount = Number(formData.get("amount"));
  const months = Number(formData.get("months"));
  const reason = formData.get("reason") as string;
  const pin = formData.get("pin") as string;

  if (!amount || amount < 1000) return { message: "Minimum loan is $1,000" };
  if (!months) return { message: "Please select a term" };

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (user?.transactionPin !== pin) {
    return { message: "Invalid Security PIN" };
  }

  // Simple 5% Flat Interest Calculation
  const interestRate = 5.0;
  const totalInterest = amount * (interestRate / 100);
  const totalRepayment = amount + totalInterest;
  const monthlyPayment = totalRepayment / months;

  try {
    await db.loan.create({
      data: {
        userId: user.id,
        amount,
        termMonths: months,
        interestRate,
        totalRepayment,
        monthlyPayment,
        reason,
        status: "PENDING"
      }
    });

    revalidatePath("/dashboard/loan");
    return { success: true, message: "Application Submitted Successfully" };

  } catch (error) {
    console.error(error);
    return { message: "Application failed. Try again." };
  }
}

export async function repayLoan(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    const loanId = formData.get("loanId") as string;
    const amount = Number(formData.get("amount"));

    if (!amount || amount <= 0) return { message: "Invalid amount." };

    try {
        const loan = await db.loan.findUnique({ where: { id: loanId } });
        if (!loan || loan.status !== 'APPROVED') return { message: "Invalid loan." };

        // 1. Validate Overpayment
        const remaining = Number(loan.totalRepayment) - Number(loan.repaidAmount);
        if (amount > remaining) {
            return { message: `You only owe $${remaining.toFixed(2)}` };
        }

        await db.$transaction(async (tx) => {
            // 2. Find User Account (Primary)
            const account = await tx.account.findFirst({
                where: { userId: session.user.id },
                orderBy: { availableBalance: 'desc' }
            });

            if (!account) throw new Error("No account found.");

            // 3. Check Funds
            if (Number(account.availableBalance) < amount) {
                throw new Error("Insufficient funds in your account.");
            }

            // 4. Deduct from Account
            await tx.account.update({
                where: { id: account.id },
                data: { availableBalance: { decrement: amount } }
            });

            // 5. Update Loan
            const newRepaidTotal = Number(loan.repaidAmount) + amount;
            // Use a small epsilon for float comparison safety, or just >=
            const isFullyPaid = newRepaidTotal >= Number(loan.totalRepayment);

            await tx.loan.update({
                where: { id: loanId },
                data: {
                    repaidAmount: { increment: amount },
                    status: isFullyPaid ? 'PAID' : 'APPROVED'
                }
            });

            // 6. Ledger Entry
            await tx.ledgerEntry.create({
                data: {
                    accountId: account.id,
                    amount: amount,
                    type: 'LOAN_REPAYMENT',
                    direction: 'DEBIT',
                    status: 'COMPLETED',
                    description: `Loan Repayment`,
                    referenceId: `REP-${Date.now()}`
                }
            });
        });

        revalidatePath("/dashboard/loan");
        return { success: true, message: `Payment of $${amount} successful!` };

    } catch (error: any) {
        return { message: error.message || "Repayment failed." };
    }
}