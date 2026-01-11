'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { TransactionType, TransactionDirection, TransactionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function adminManageFunds(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') return { success: false, message: "Unauthorized" };

  const userId = formData.get("userId") as string;
  const amountStr = formData.get("amount") as string;
  const type = formData.get("type") as "ADD" | "DEDUCT";
  const reason = formData.get("reason") as string || "Admin Adjustment";

  const amount = parseFloat(amountStr);

  if (!userId || !amount || amount <= 0) {
    return { success: false, message: "Invalid amount" };
  }

  try {
    // 1. Find the User's Primary Account
    const account = await db.account.findFirst({
        where: { userId }
    });

    if (!account) return { success: false, message: "User has no account" };

    // 2. Perform Atomic Transaction
    await db.$transaction(async (tx) => {

        // A. Update Balance
        if (type === 'ADD') {
            await tx.account.update({
                where: { id: account.id },
                data: { availableBalance: { increment: amount } }
            });
        } else {
            // Check sufficiency for deduction
            if (Number(account.availableBalance) < amount) {
                throw new Error("Insufficient funds for deduction");
            }
            await tx.account.update({
                where: { id: account.id },
                data: { availableBalance: { decrement: amount } }
            });
        }

        // B. Create Ledger Record (So user sees it in their history)
        await tx.ledgerEntry.create({
            data: {
                accountId: account.id,
                referenceId: `ADMIN-${Date.now()}`, // Unique Ref
                amount: amount,
                type: type === 'ADD' ? TransactionType.DEPOSIT : TransactionType.FEE, // Tag properly
                direction: type === 'ADD' ? TransactionDirection.CREDIT : TransactionDirection.DEBIT,
                status: TransactionStatus.COMPLETED,
                description: reason,
            }
        });
    });

    revalidatePath("/admin/users");
    return { success: true, message: type === 'ADD' ? "Funds Added" : "Funds Deducted" };

  } catch (error: any) {
    return { success: false, message: error.message || "Transaction Failed" };
  }
}