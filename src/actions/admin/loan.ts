'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { logAdminAction } from "@/lib/utils/admin-logger";
import { canPerform } from "@/lib/auth/permissions";
import {
    TransactionType,
    TransactionDirection,
    TransactionStatus,
    UserRole,
    UserStatus
} from "@prisma/client";

export async function processLoan(loanId: string, decision: 'APPROVED' | 'REJECTED') {
    const { authorized, session } = await checkAdminAction();

    if (!authorized || !session || !session.user) {
        return { success: false, message: "Unauthorized" };
    }

    if (!canPerform(session.user.role as UserRole, 'MONEY')) {
        return { success: false, message: "Insufficient permissions. Only Admins can process loans." };
    }

    try {
        const loan = await db.loan.findUnique({
            where: { id: loanId },
            include: { user: true }
        });

        if (!loan || loan.status !== 'PENDING') {
            return { success: false, message: "Loan not valid or already processed" };
        }

        if (loan.user.status === UserStatus.ARCHIVED) {
            return { success: false, message: "Action Denied: This user account is archived." };
        }

        if (loan.user.status === UserStatus.FROZEN || loan.user.status === UserStatus.SUSPENDED) {
             return { success: false, message: `Action Denied: User status is ${loan.user.status}` };
        }

        // --- BRANCH 1: REJECTION ---
        if (decision === 'REJECTED') {
            await db.$transaction(async (tx) => {
                await tx.loan.update({
                    where: { id: loanId },
                    data: { status: 'REJECTED' }
                });
            });

            // Notify User
            await db.notification.create({
                data: {
                    userId: loan.userId,
                    title: "Loan Application Declined",
                    message: `Your loan request for $${Number(loan.amount).toLocaleString()} was not approved at this time.`,
                    type: "ERROR",
                    link: "/dashboard/loan",
                    isRead: false
                }
            });

            await logAdminAction(
                "REJECT_LOAN",
                loanId,
                {
                    amount: Number(loan.amount),
                    reason: "Admin decision",
                    admin: session.user.email
                },
                "WARNING",
                "SUCCESS"
            );
        }

        // --- BRANCH 2: APPROVAL ---
        else {
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
                    orderBy: { isPrimary: 'desc' }
                });

                if (!account) throw new Error("User has no account to credit");

                const loanAmount = Number(loan.amount);
                const currentBal = Number(account.currentBalance);
                const newBal = currentBal + loanAmount;

                // C. Credit the Account
                await tx.account.update({
                    where: { id: account.id },
                    data: {
                        availableBalance: { increment: loan.amount },
                        currentBalance: { increment: loan.amount }
                    }
                });

                // D. Create Ledger Entry
                await tx.ledgerEntry.create({
                    data: {
                        accountId: account.id,
                        amount: loan.amount,
                        balanceAfter: newBal,
                        type: TransactionType.DEPOSIT,
                        direction: TransactionDirection.CREDIT,
                        status: TransactionStatus.COMPLETED,
                        description: `Loan Disbursement: ${loan.reason}`,
                        referenceId: `LOAN-${loan.id.slice(-8).toUpperCase()}`,
                        metadata: JSON.stringify({ adminId: session.user.id })
                    }
                });
            });

            // Notifications
            await db.notification.create({
                data: {
                    userId: loan.userId,
                    title: "Loan Approved!",
                    message: `Success! $${Number(loan.amount).toLocaleString()} has been deposited into your account.`,
                    type: "SUCCESS",
                    link: "/dashboard/loan",
                    isRead: false
                }
            });

            await logAdminAction(
                "APPROVE_LOAN",
                loanId,
                {
                    amount: Number(loan.amount),
                    admin: session.user.email
                },
                "INFO",
                "SUCCESS"
            );
        }

    } catch (error) {
        console.error("Loan Error:", error);
        return { success: false, message: "System Error processing loan" };
    }

    revalidatePath("/admin/loans");

    return {
        success: true,
        message: decision === 'APPROVED' ? "Funds Disbursed Successfully" : "Loan Rejected"
    };
}