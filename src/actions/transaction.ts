'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { LedgerService } from "@/lib/ledger";
import { TransactionType, TransactionDirection } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function simulateDeposit(amount: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  // 1. Get the user's account
  const account = await db.account.findFirst({
    where: { userId: session.user.id },
  });

  if (!account) return { error: "No account found" };

  try {
    // 2. Call the Ledger
    await LedgerService.recordTransaction({
      accountId: account.id,
      amount: amount,
      type: TransactionType.DEPOSIT,
      direction: TransactionDirection.CREDIT,
      description: "Test Deposit via Simulation",
    });

    // 3. Refresh the Dashboard UI
    revalidatePath("/dashboard");
    return { success: true, message: `Deposited $${amount}` };
  } catch (err) {
    return { error: "Deposit Failed" };
  }
}