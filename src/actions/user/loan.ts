'use server';

import { getAuthenticatedUser } from "@/lib/auth/user-guard";
import { db } from "@/lib/db";
import { checkPermissions, verifyPin, checkMaintenanceMode } from "@/lib/security";
import { revalidatePath } from "next/cache";
import {
    TransactionType,
    TransactionDirection,
    TransactionStatus,
    UserRole
} from "@prisma/client";
import { z } from "zod";

const sanitize = (str: string) => str.replace(/<[^>]*>/g, '');

const loanApplicationSchema = z.object({
  amount: z.coerce.number().min(500, "Minimum loan amount is $500"),
  months: z.coerce.number().int().min(1, "Please select a term"),
  reason: z.string().max(200).optional(),
  pin: z.string().length(4, "PIN must be 4 digits"),
  displayAmount: z.string().optional(),
  displayCurrency: z.string().optional(),
});

const repaymentSchema = z.object({
  loanId: z.string().min(1, "Loan ID is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  displayAmount: z.string().optional(),
  displayCurrency: z.string().optional(),
});

export async function applyForLoan(prevState: any, formData: FormData) {
    const { success, message, user } = await getAuthenticatedUser();

    if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }

    if (!success || !user) return { message };

  const rawData = {
  amount: formData.get("amount") as string,
  months: formData.get("months") as string,
  reason: formData.get("reason") as string,
  pin: formData.get("pin") as string,
  displayAmount: formData.get("displayAmount") as string,
  displayCurrency: formData.get("displayCurrency") as string,
};

const validated = loanApplicationSchema.safeParse(rawData);
if (!validated.success) {
  return { message: validated.error.issues[0].message };
}

const { amount, months, reason: rawReason, pin, displayAmount, displayCurrency } = validated.data;

const reason = rawReason ? sanitize(rawReason) : "";

    const pinValidation = await verifyPin(user.id, pin);
    if (!pinValidation.success) return { message: pinValidation.error };

    const permission = await checkPermissions(user.id, 'LOAN_APPLY');
    if (!permission.allowed) {
        return { message: `🚫 ${permission.error}` };
    }

    const interestRate = 5.0;
    const totalInterest = amount * (interestRate / 100);
    const totalRepayment = amount + totalInterest;
    const monthlyPayment = totalRepayment / months;

    try {
        const loan = await db.$transaction(async (tx) => {
            return await tx.loan.create({
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
        });

        try {
            const admins = await db.user.findMany({
                where: { role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] } },
                select: { id: true }
            });

            const formatStr = (displayAmount && displayCurrency)
                ? `${displayCurrency} ${Number(displayAmount).toLocaleString()}`
                : `$${amount.toLocaleString()}`;

            if (admins.length > 0) {
                await db.notification.createMany({
                    data: admins.map((admin) => ({
                        userId: admin.id,
                        title: "New Loan Application",
                        message: `Loan Request: ${formatStr} from ${sanitize(user.fullName || 'User')}`,
                        type: "INFO",
                        link: `/admin/loans?id=${loan.id}`,
                        isRead: false
                    }))
                });
            }
        } catch (notifErr) {
            console.error("Loan Notification Failed:", notifErr);
        }

    } catch (error) {
        console.error(error);
        return { message: "Application failed. Try again." };
    }

    revalidatePath("/dashboard/loans");
    return { success: true, message: "Application Submitted Successfully" };
}


export async function repayLoan(prevState: any, formData: FormData) {
    const { success, message, user } = await getAuthenticatedUser();

    if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }

    if (!success || !user) return { message };

    const permission = await checkPermissions(user.id, 'LOAN_REPAY');
    if (!permission.allowed) {
        return { message: `🚫 ${permission.error}` };
    }

   const rawData = {
  loanId: formData.get("loanId") as string,
  amount: formData.get("amount") as string,
  displayAmount: formData.get("displayAmount") as string,
  displayCurrency: formData.get("displayCurrency") as string,
};

const validated = repaymentSchema.safeParse(rawData);
if (!validated.success) {
  return { message: validated.error.issues[0].message };
}

const { loanId, amount, displayAmount, displayCurrency } = validated.data;

   const loan = await db.loan.findUnique({
    where: { id: loanId, userId: user.id }
});
if (!loan || loan.status !== 'APPROVED') return { message: "Invalid loan." };

    const remaining = Number(loan.totalRepayment) - Number(loan.repaidAmount);
    if (amount > remaining + 1) {
        return { message: `Overpayment detected. You owe $${remaining.toFixed(2)}` };
    }

    try {
        await db.$transaction(async (tx) => {
            const account = await tx.account.findFirst({
                where: { userId: user.id },
                orderBy: { availableBalance: 'desc' }
            });

            if (!account) throw new Error("No account found.");

            if (Number(account.availableBalance) < amount) {
                throw new Error("Insufficient funds.");
            }

            await tx.account.update({
                where: { id: account.id },
                data: {
                    availableBalance: { decrement: amount },
                    currentBalance: { decrement: amount }
                }
            });

            const newRepaidTotal = Number(loan.repaidAmount) + amount;
            const isFullyPaid = newRepaidTotal >= Number(loan.totalRepayment) - 0.5; // Tolerance

            await tx.loan.update({
                where: { id: loanId },
                data: {
                    repaidAmount: { increment: amount },
                    status: isFullyPaid ? 'PAID' : 'APPROVED'
                }
            });

            await tx.ledgerEntry.create({
                data: {
                    accountId: account.id,
                    amount: amount,
                    type: TransactionType.LOAN_REPAYMENT,
                    direction: TransactionDirection.DEBIT,
                    status: TransactionStatus.COMPLETED,
                    description: `Loan Repayment`,
                    referenceId: `REP-${Date.now()}`
                }
            });
        });

        const formatStr = (displayAmount && displayCurrency)
            ? `${displayCurrency} ${Number(displayAmount).toLocaleString()}`
            : `$${amount.toLocaleString()}`;

        await db.notification.create({
            data: {
                userId: user.id,
                title: "Repayment Successful",
                message: `You successfully repaid ${formatStr} towards your loan.`,
                type: "SUCCESS",
                link: "/dashboard/loans",
                isRead: false
            }
        });

    } catch (error: any) {
        return { message: error.message || "Repayment failed." };
    }

    revalidatePath("/dashboard/loans");
    return { success: true, message: `Payment successful!` };
}