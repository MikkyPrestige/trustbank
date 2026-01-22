'use server';

import { getAuthenticatedUser } from "@/lib/user-guard";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  TransactionType,
  TransactionDirection,
  TransactionStatus
} from "@prisma/client";

export async function payBill(prevState: any, formData: FormData) {
   const { success, message, user } = await getAuthenticatedUser();

    if (!success || !user) {
        return { message };
    }

    const amount = Number(formData.get("amount"));
    const provider = formData.get("provider") as string;
    const pin = formData.get("pin") as string;
    const accountNumber = formData.get("accountNumber") as string;

    if (!amount || amount <= 0) return { success: false, message: "Invalid amount" };

    try {
        if (user.transactionPin !== pin) {
            return { success: false, message: "Invalid PIN" };
        }

        // 1. EXECUTE PAYMENT (Transaction)
        const billTxId = await db.$transaction(async (tx) => {
            const account = await tx.account.findFirst({
                where: { userId: user.id },
                orderBy: { availableBalance: 'desc' }
            });

            if (!account || Number(account.availableBalance) < amount) {
                throw new Error("Insufficient funds");
            }

            // A. Deduct Money
            await tx.account.update({
                where: { id: account.id },
                data: {
                    availableBalance: { decrement: amount },
                    currentBalance: { decrement: amount }
                }
            });

            // B. Log Transaction & Return ID
            const billTx = await tx.ledgerEntry.create({
                data: {
                    accountId: account.id,
                    amount: amount,
                    type: TransactionType.BILL_PAYMENT,
                    direction: TransactionDirection.DEBIT,
                    status: TransactionStatus.COMPLETED,
                    description: `Bill Payment: ${provider} (${accountNumber || 'N/A'})`,
                    referenceId: `BILL-${Date.now()}`
                }
            });

            return billTx.id;
        });

        // 2. NOTIFY USER (Outside Transaction)
        await db.notification.create({
            data: {
                userId: user.id,
                title: "Bill Payment Successful",
                message: `You successfully paid $${amount.toLocaleString()} to ${provider}.`,
                type: "SUCCESS",
                link: `/dashboard/transactions/${billTxId}`,
                isRead: false
            }
        });

    } catch (error: any) {
        return { success: false, message: error.message || "Payment Failed" };
    }

    revalidatePath("/dashboard");
    return { success: true, message: `Successfully paid ${provider}` };
}




// 'use server';

// import { auth } from "@/auth";
// import { db } from "@/lib/db";
// import { revalidatePath } from "next/cache";
// import {
//   UserStatus,
//   TransactionType,
//   TransactionDirection,
//   TransactionStatus
// } from "@prisma/client";

// export async function payBill(prevState: any, formData: FormData) {
//     const session = await auth();
//     if (!session) return { success: false, message: "Unauthorized" };

//     const amount = Number(formData.get("amount"));
//     const provider = formData.get("provider") as string;
//     const pin = formData.get("pin") as string;
//     const accountNumber = formData.get("accountNumber") as string;

//     if (!amount || amount <= 0) return { success: false, message: "Invalid amount" };

//     try {
//         const user = await db.user.findUnique({ where: { id: session.user.id } });
//         if (!user) return { success: false, message: "User not found" };

//         if (user.status === UserStatus.FROZEN) {
//             return { success: false, message: "Account Frozen" };
//         }

//         if (user.transactionPin !== pin) {
//             return { success: false, message: "Invalid PIN" };
//         }

//         await db.$transaction(async (tx) => {
//             const account = await tx.account.findFirst({
//                 where: { userId: session.user.id },
//                 orderBy: { availableBalance: 'desc' }
//             });

//             if (!account || Number(account.availableBalance) < amount) {
//                 throw new Error("Insufficient funds");
//             }

//             // 1. Deduct Money
//             await tx.account.update({
//                 where: { id: account.id },
//                 data: {
//                     availableBalance: { decrement: amount },
//                     currentBalance: { decrement: amount }
//                 }
//             });

//             // 2. Log Transaction AND Capture Result
//             const billTx = await tx.ledgerEntry.create({
//                 data: {
//                     accountId: account.id,
//                     amount: amount,
//                     type: TransactionType.BILL_PAYMENT,
//                     direction: TransactionDirection.DEBIT,
//                     status: TransactionStatus.COMPLETED,
//                     description: `Bill Payment: ${provider} (${accountNumber || 'N/A'})`,
//                     referenceId: `BILL-${Date.now()}`
//                 }
//             });

//             // 3. Create Notification with Specific Link
//             await tx.notification.create({
//                 data: {
//                     userId: session.user.id,
//                     title: "Bill Payment Successful",
//                     message: `You successfully paid $${amount.toLocaleString()} to ${provider}.`,
//                     type: "SUCCESS",
//                     link: `/dashboard/transactions/${billTx.id}`,
//                     isRead: false
//                 }
//             });
//         });

//     } catch (error: any) {
//         return { success: false, message: error.message || "Payment Failed" };
//     }

//     revalidatePath("/dashboard");
//     return { success: true, message: `Successfully paid ${provider}` };
// }