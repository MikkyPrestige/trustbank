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

// ==========================================
// 📝 APPLY FOR LOAN
// ==========================================
export async function applyForLoan(prevState: any, formData: FormData) {
  const { success, message, user } = await getAuthenticatedUser();

  // 1. 🚧 Global Kill Switch
  if (await checkMaintenanceMode()) {
      return { success: false, message: "System is currently under maintenance. Please try again later." };
  }

  if (!success || !user) return { message };

  const amount = Number(formData.get("amount"));
  const months = Number(formData.get("months"));
  const reason = formData.get("reason") as string;
  const pin = formData.get("pin") as string;

  if (!amount || amount < 1000) return { message: "Minimum loan is $1,000" };
  if (!months) return { message: "Please select a term" };

  // 2. 🔐 Verify PIN
  const pinValidation = await verifyPin(user.id, pin);
  if (!pinValidation.success) return { message: pinValidation.error };

  // 3. 🛡️ Permission Check (Handles Feature Flag & KYC)
 const permission = await checkPermissions(user.id, 'LOAN_APPLY');
  if (!permission.allowed) {
      return { message: `🚫 ${permission.error}` };
  }

  // Calculation
  const interestRate = 5.0;
  const totalInterest = amount * (interestRate / 100);
  const totalRepayment = amount + totalInterest;
  const monthlyPayment = totalRepayment / months;

  try {
      // 4. Create Loan
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

      // 5. Notify Admins
      try {
          const admins = await db.user.findMany({
              where: { role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] } },
              select: { id: true }
          });

          if (admins.length > 0) {
              await db.notification.createMany({
                  data: admins.map((admin) => ({
                      userId: admin.id,
                      title: "New Loan Application",
                      message: `Loan Request: $${amount.toLocaleString()} from ${user.fullName || 'User'}`,
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

// ==========================================
// 💸 REPAY LOAN
// ==========================================
export async function repayLoan(prevState: any, formData: FormData) {
  const { success, message, user } = await getAuthenticatedUser();

  // 1. 🚧 Global Kill Switch
  if (await checkMaintenanceMode()) {
      return { success: false, message: "System is currently under maintenance. Please try again later." };
  }

  if (!success || !user) return { message };

  const permission = await checkPermissions(user.id, 'LOAN_REPAY');
  if (!permission.allowed) {
      return { message: `🚫 ${permission.error}` };
  }

  const loanId = formData.get("loanId") as string;
  const amount = Number(formData.get("amount"));

  if (!amount || amount <= 0) return { message: "Invalid amount." };

  const loan = await db.loan.findUnique({ where: { id: loanId } });
  if (!loan || loan.status !== 'APPROVED') return { message: "Invalid loan." };

  const remaining = Number(loan.totalRepayment) - Number(loan.repaidAmount);
  if (amount > remaining) {
      return { message: `You only owe $${remaining.toFixed(2)}` };
  }

  try {
      await db.$transaction(async (tx) => {
          // A. Find Account
          const account = await tx.account.findFirst({
              where: { userId: user.id },
              orderBy: { availableBalance: 'desc' }
          });

          if (!account) throw new Error("No account found.");

          // B. Check Funds
          if (Number(account.availableBalance) < amount) {
              throw new Error("Insufficient funds.");
          }

          // C. Deduct from Account
          await tx.account.update({
              where: { id: account.id },
              data: {
                  availableBalance: { decrement: amount },
                  currentBalance: { decrement: amount }
              }
          });

          // D. Update Loan
          const newRepaidTotal = Number(loan.repaidAmount) + amount;
          const isFullyPaid = newRepaidTotal >= Number(loan.totalRepayment);

          await tx.loan.update({
              where: { id: loanId },
              data: {
                  repaidAmount: { increment: amount },
                  status: isFullyPaid ? 'PAID' : 'APPROVED'
              }
          });

          // E. Ledger Entry
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

      // 3. Notify User
      await db.notification.create({
          data: {
              userId: user.id,
              title: "Repayment Successful",
              message: `You successfully repaid $${amount.toLocaleString()} towards your loan.`,
              type: "SUCCESS",
              link: "/dashboard/loans",
              isRead: false
          }
      });

  } catch (error: any) {
      return { message: error.message || "Repayment failed." };
  }

  revalidatePath("/dashboard/loans");
  return { success: true, message: `Payment of $${amount} successful!` };
}


// 'use server';

// import { auth } from "@/auth";
// import { db } from "@/lib/db";
// import { checkPermissions, verifyPin } from "@/lib/security";
// import { revalidatePath } from "next/cache";
// import {
//   UserStatus,
//   KycStatus,
//   TransactionType,
//   TransactionDirection,
//   TransactionStatus
// } from "@prisma/client";

// // --- APPLY ---
// export async function applyForLoan(prevState: any, formData: FormData) {
//     const session = await auth();
//     if (!session?.user?.id) return { message: "Unauthorized" };

//     const amount = Number(formData.get("amount"));
//     const months = Number(formData.get("months"));
//     const reason = formData.get("reason") as string;
//     const pin = formData.get("pin") as string;

//     if (!amount || amount < 1000) return { message: "Minimum loan is $1,000" };
//     if (!months) return { message: "Please select a term" };

//     // 1. PIN Check
//     const pinValidation = await verifyPin(session.user.id, pin);
//     if (!pinValidation.success) return { message: pinValidation.error };

//     // 2. Permission Check
//     const permission = await checkPermissions(session.user.id, 'LOAN');
//     if (!permission.allowed) return { message: `🚫 ${permission.error}` };

//     const user = await db.user.findUnique({ where: { id: session.user.id } });
//     if (!user) return { message: "User not found" };

//     // 🛑 FROZEN CHECK
//     if (user.status === UserStatus.FROZEN) {
//         return { message: "🚫 Account Frozen. You cannot apply for new loans." };
//     }

//     // 3. KYC Check
//     if (user.kycStatus !== KycStatus.VERIFIED) {
//         return { message: "Access Denied. Identity verification required for loans." };
//     }

//     const interestRate = 5.0;
//     const totalInterest = amount * (interestRate / 100);
//     const totalRepayment = amount + totalInterest;
//     const monthlyPayment = totalRepayment / months;

//     try {
//         // 👇 CHANGED: Wrapped in transaction to notify Admins
//         await db.$transaction(async (tx) => {

//             // A. Create Loan Record
//             const loan = await tx.loan.create({
//                 data: {
//                     userId: user.id,
//                     amount,
//                     termMonths: months,
//                     interestRate,
//                     totalRepayment,
//                     monthlyPayment,
//                     reason,
//                     status: "PENDING"
//                 }
//             });

//             // 👇 NEW: NOTIFY ADMINS & SUPER ADMINS
//             const admins = await tx.user.findMany({
//                 where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
//                 select: { id: true }
//             });

//             if (admins.length > 0) {
//                 await tx.notification.createMany({
//                     data: admins.map((admin) => ({
//                         userId: admin.id,
//                         title: "New Loan Application",
//                         message: `Loan Request: $${amount.toLocaleString()} from ${user.fullName || 'User'}`,
//                         type: "INFO",
//                         link: `/admin/loans?id=${loan.id}`,
//                         isRead: false
//                     }))
//                 });
//             }
//             // 👆 END NEW CODE
//         });

//     } catch (error) {
//         console.error(error);
//         return { message: "Application failed. Try again." };
//     }

//     revalidatePath("/dashboard/loan");
//     return { success: true, message: "Application Submitted Successfully" };
// }

// // --- REPAY ---
// // (No changes needed here as repayment is automated)
// export async function repayLoan(prevState: any, formData: FormData) {
//     const session = await auth();
//     if (!session) return { message: "Unauthorized" };

//     const loanId = formData.get("loanId") as string;
//     const amount = Number(formData.get("amount"));

//     if (!amount || amount <= 0) return { message: "Invalid amount." };

//     // 1. PRE-CHECKS
//     const user = await db.user.findUnique({ where: { id: session.user.id } });
//     if (!user) return { message: "User not found." };

//     const loan = await db.loan.findUnique({ where: { id: loanId } });
//     if (!loan || loan.status !== 'APPROVED') return { message: "Invalid loan." };

//     const remaining = Number(loan.totalRepayment) - Number(loan.repaidAmount);
//     if (amount > remaining) {
//         return { message: `You only owe $${remaining.toFixed(2)}` };
//     }

//     // 2. EXECUTE REPAYMENT
//     try {
//         await db.$transaction(async (tx) => {
//             // A. Find Account
//             const account = await tx.account.findFirst({
//                 where: { userId: session.user.id },
//                 orderBy: { availableBalance: 'desc' }
//             });

//             if (!account) throw new Error("No account found.");

//             // B. Check Funds
//             if (Number(account.availableBalance) < amount) {
//                 throw new Error("Insufficient funds.");
//             }

//             // C. Deduct from Account
//             await tx.account.update({
//                 where: { id: account.id },
//                 data: {
//                     availableBalance: { decrement: amount },
//                     currentBalance: { decrement: amount }
//                 }
//             });

//             // D. Update Loan
//             const newRepaidTotal = Number(loan.repaidAmount) + amount;
//             const isFullyPaid = newRepaidTotal >= Number(loan.totalRepayment);

//             await tx.loan.update({
//                 where: { id: loanId },
//                 data: {
//                     repaidAmount: { increment: amount },
//                     status: isFullyPaid ? 'PAID' : 'APPROVED'
//                 }
//             });

//             // E. Ledger Entry
//             await tx.ledgerEntry.create({
//                 data: {
//                     accountId: account.id,
//                     amount: amount,
//                     type: TransactionType.LOAN_REPAYMENT,
//                     direction: TransactionDirection.DEBIT,
//                     status: TransactionStatus.COMPLETED,
//                     description: `Loan Repayment`,
//                     referenceId: `REP-${Date.now()}`
//                 }
//             });
//         });

//     } catch (error: any) {
//         return { message: error.message || "Repayment failed." };
//     }

//     revalidatePath("/dashboard/loan");
//     return { success: true, message: `Payment of $${amount} successful!` };
// }