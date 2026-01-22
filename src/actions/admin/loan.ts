'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/admin-logger";
import { canPerform } from "@/lib/permissions"; // 👈 Import Permissions
import {
  TransactionType,
  TransactionDirection,
  TransactionStatus,
  UserRole // 👈 Import UserRole
} from "@prisma/client";

export async function processLoan(loanId: string, decision: 'APPROVED' | 'REJECTED') {
    // 1. Security Check
    const { authorized, session } = await checkAdminAction();

    // ✅ Session Safety
    if (!authorized || !session || !session.user) {
        return { message: "Unauthorized" };
    }

    // ✅ Permission Check (Strictly 'MONEY' required)
    if (!canPerform(session.user.role as UserRole, 'MONEY')) {
        return { message: "Insufficient permissions. Only Admins can process loans." };
    }

    try {
        const loan = await db.loan.findUnique({ where: { id: loanId }, include: { user: true } });

        if (!loan || loan.status !== 'PENDING') return { message: "Loan not valid or already processed" };

        // --- BRANCH 1: REJECTION ---
        if (decision === 'REJECTED') {
            // 1. DB Update (Fast)
            await db.$transaction(async (tx) => {
                await tx.loan.update({
                    where: { id: loanId },
                    data: { status: 'REJECTED' }
                });
            });

            // 2. Side Effects (Outside Transaction)
            await logAdminAction("REJECT_LOAN", loanId, {
                amount: Number(loan.amount),
                reason: "Admin decision",
                admin: session.user.email
            });

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
        }

        // --- BRANCH 2: APPROVAL ---
        else {
            // 1. CRITICAL FINANCIAL TRANSACTION
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
                        metadata: { adminId: session.user.id }
                    }
                });
            });

            // 2. SIDE EFFECTS (Outside Transaction)
            await logAdminAction("APPROVE_LOAN", loanId, {
                amount: Number(loan.amount),
                admin: session.user.email
            });

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
        }

    } catch (error) {
        console.error("Loan Error:", error);
        return { message: "System Error processing loan" };
    }

    revalidatePath("/admin/loans");

    return { success: true, message: decision === 'APPROVED' ? "Funds Disbursed Successfully" : "Loan Rejected" };
}


// 'use server';

// import { db } from "@/lib/db";
// import { revalidatePath } from "next/cache";
// import { checkAdminAction } from "@/lib/admin-auth";
// import { logAdminAction } from "@/lib/admin-logger";
// import {
//   TransactionType,
//   TransactionDirection,
//   TransactionStatus
// } from "@prisma/client";

// export async function processLoan(loanId: string, decision: 'APPROVED' | 'REJECTED') {
//     // 1. Security Check
//     const { authorized, session } = await checkAdminAction();
//     if (!authorized) return { message: "Unauthorized" };

//     try {
//         const loan = await db.loan.findUnique({ where: { id: loanId }, include: { user: true } });

//         if (!loan || loan.status !== 'PENDING') return { message: "Loan not valid or already processed" };

//         // --- BRANCH 1: REJECTION ---
//         if (decision === 'REJECTED') {
//             await db.$transaction(async (tx) => {
//                 await tx.loan.update({
//                     where: { id: loanId },
//                     data: { status: 'REJECTED' }
//                 });

//                 await logAdminAction("REJECT_LOAN", loanId, {
//                     amount: Number(loan.amount),
//                     reason: "Admin decision",
//                     admin: session?.user?.email
//                 });

//                 // 👇 NEW: NOTIFY USER (REJECTION)
//                 await tx.notification.create({
//                     data: {
//                         userId: loan.userId,
//                         title: "Loan Application Declined",
//                         message: `Your loan request for $${Number(loan.amount).toLocaleString()} was not approved at this time.`,
//                         type: "ERROR",
//                         link: "/dashboard/loan",
//                         isRead: false
//                     }
//                 });
//                 // 👆 END NEW CODE
//             });
//         }

//         // --- BRANCH 2: APPROVAL (TRANSACTION) ---
//         else {
//             await db.$transaction(async (tx) => {
//                 // A. Update Loan Status
//                 await tx.loan.update({
//                     where: { id: loanId },
//                     data: {
//                         status: 'APPROVED',
//                         approvedAt: new Date()
//                     }
//                 });

//                 // B. Find User's Primary Account
//                 const account = await tx.account.findFirst({
//                     where: { userId: loan.userId },
//                     orderBy: { isPrimary: 'desc' }
//                 });

//                 if (!account) throw new Error("User has no account to credit");

//                 // Math Conversion
//                 const loanAmount = Number(loan.amount);
//                 const currentBal = Number(account.currentBalance);
//                 const newBal = currentBal + loanAmount;

//                 // C. Credit the Account
//                 await tx.account.update({
//                     where: { id: account.id },
//                     data: {
//                         availableBalance: { increment: loan.amount },
//                         currentBalance: { increment: loan.amount }
//                     }
//                 });

//                 // D. Create Ledger Entry
//                 await tx.ledgerEntry.create({
//                     data: {
//                         accountId: account.id,
//                         amount: loan.amount,
//                         balanceAfter: newBal,

//                         type: TransactionType.DEPOSIT,
//                         direction: TransactionDirection.CREDIT,
//                         status: TransactionStatus.COMPLETED,

//                         description: `Loan Disbursement: ${loan.reason}`,
//                         referenceId: `LOAN-${loan.id.slice(-8).toUpperCase()}`,
//                         metadata: { adminId: session?.user?.id }
//                     }
//                 });

//                 // 👇 NEW: NOTIFY USER (APPROVAL)
//                 await tx.notification.create({
//                     data: {
//                         userId: loan.userId,
//                         title: "Loan Approved!",
//                         message: `Success! $${loanAmount.toLocaleString()} has been deposited into your account.`,
//                         type: "SUCCESS", // Green Alert
//                         link: "/dashboard/loan",
//                         isRead: false
//                     }
//                 });
//                 // 👆 END NEW CODE
//             });

//             await logAdminAction("APPROVE_LOAN", loanId, {
//                 amount: Number(loan.amount),
//                 admin: session?.user?.email
//             });
//         }

//     } catch (error) {
//         console.error("Loan Error:", error);
//         return { message: "System Error processing loan" };
//     }

//     revalidatePath("/admin/loans");

//     return { success: true, message: decision === 'APPROVED' ? "Funds Disbursed Successfully" : "Loan Rejected" };
// }