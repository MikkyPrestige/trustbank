'use server';

import { getAuthenticatedUser } from "@/lib/auth/user-guard";
import { db } from "@/lib/db";
import { checkMaintenanceMode } from "@/lib/security";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import {
  TransactionType,
  TransactionDirection,
  TransactionStatus
} from "@prisma/client";

export async function payBill(prevState: any, formData: FormData) {
   const { success, message, user: sessionUser } = await getAuthenticatedUser();

   if (await checkMaintenanceMode()) {
       return { success: false, message: "System is currently under maintenance." };
   }

   if (!success || !sessionUser) {
       return { message };
   }

   const amount = Number(formData.get("amount"));
   const provider = formData.get("provider") as string;
   const rawPin = formData.get("pin") as string;
   const accountNumber = formData.get("accountNumber") as string;

   if (!amount || amount <= 0) return { success: false, message: "Invalid amount" };

   try {
       // 1. Fetch REAL user
       const dbUser = await db.user.findUnique({
           where: { id: sessionUser.id }
       });

       if (!dbUser) return { success: false, message: "User not found" };

       if (!dbUser.transactionPin) {
           return { success: false, message: "Transaction PIN not set." };
       }

       // 2.  VERIFY PIN (Compare Hash)
       const isPinValid = await bcrypt.compare(rawPin, dbUser.transactionPin);

       if (!isPinValid) {
           return { success: false, message: "Invalid PIN" };
       }

       // 3. EXECUTE PAYMENT
       const billTxId = await db.$transaction(async (tx) => {
           const account = await tx.account.findFirst({
               where: { userId: dbUser.id },
               orderBy: { availableBalance: 'desc' }
           });

           if (!account || Number(account.availableBalance) < amount) {
               throw new Error("Insufficient funds");
           }

           await tx.account.update({
               where: { id: account.id },
               data: {
                   availableBalance: { decrement: amount },
                   currentBalance: { decrement: amount }
               }
           });

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

       // 4. Notify
       await db.notification.create({
           data: {
               userId: dbUser.id,
               title: "Bill Payment Successful",
               message: `You successfully paid $${amount.toLocaleString()} to ${provider}.`,
               type: "SUCCESS",
               link: `/dashboard/transactions/${billTxId}`,
               isRead: false
           }
       });

   } catch (error: any) {
       console.error("Payment Error:", error);
       return { success: false, message: error.message || "Payment Failed" };
   }

   revalidatePath("/dashboard");
   return { success: true, message: `Successfully paid ${provider}` };
}