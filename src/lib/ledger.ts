import { db } from "@/lib/db";
import { TransactionType, TransactionDirection, TransactionStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";

interface TransactionRequest {
  accountId: string;
  amount: number;
  type: TransactionType;
  direction: TransactionDirection;
  description: string;
  referenceId?: string; // External ID (like from Stripe) or internal unique ID
  metadata?: any;
}

export const LedgerService = {
  /**
   * ATOMIC TRANSACTION:
   * 1. Creates a Ledger Entry (The Receipt)
   * 2. Updates the Account Balance (The Wallet)
   * 3. Either BOTH happen, or NEITHER happens.
   */
  async recordTransaction(tx: TransactionRequest) {
    // Generate a unique reference if not provided
    const referenceId = tx.referenceId || `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    try {
      return await db.$transaction(async (prisma) => {
        // 1. Create the Record
        const entry = await prisma.ledgerEntry.create({
          data: {
            accountId: tx.accountId,
            amount: tx.amount,
            type: tx.type,
            direction: tx.direction,
            status: TransactionStatus.COMPLETED,
            description: tx.description,
            referenceId: referenceId,
            metadata: tx.metadata || {},
          },
        });

        // 2. Calculate Balance Update
        // If CREDIT (Money In) -> Increment
        // If DEBIT (Money Out) -> Decrement
        const incrementValue = tx.direction === TransactionDirection.CREDIT ? tx.amount : -tx.amount;

        // 3. Update the Wallet
        const updatedAccount = await prisma.account.update({
          where: { id: tx.accountId },
          data: {
            availableBalance: {
              increment: incrementValue,
            },
          },
        });

        return { entry, newBalance: updatedAccount.availableBalance };
      });
    } catch (error) {
      console.error("Ledger Error:", error);
      throw new Error("Transaction Failed: Integrity Check Failed");
    }
  },

  /**
   * P2P TRANSFER: Atomic movement between two internal accounts
   */
  async transferFunds(params: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    description?: string;
  }) {
    const { fromAccountId, toAccountId, amount, description } = params;
    // Base Reference ID
    const baseRef = `TRF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return await db.$transaction(async (tx) => {
      // 1. Check Sender Balance
      const sender = await tx.account.findUnique({ where: { id: fromAccountId } });
  if (!sender || sender.availableBalance.toNumber() < amount) {
        throw new Error("Insufficient funds");
      }

      // 2. Decrement Sender (Money Out)
      await tx.account.update({
        where: { id: fromAccountId },
        data: { availableBalance: { decrement: amount } },
      });

      // 3. Increment Receiver (Money In)
      await tx.account.update({
        where: { id: toAccountId },
        data: { availableBalance: { increment: amount } },
      });

      // 4. Create Ledger Entry for SENDER (Debit)
      await tx.ledgerEntry.create({
        data: {
          accountId: fromAccountId,
          amount: amount,
          type: "TRANSFER",
          direction: "DEBIT",
          status: "COMPLETED",
          description: description || `Transfer to ${toAccountId}`,
         referenceId: `${baseRef}-OUT`,
          metadata: { relatedAccountId: toAccountId, baseRef },
        },
      });

      // 5. Create Ledger Entry for RECEIVER (Credit)
      await tx.ledgerEntry.create({
        data: {
          accountId: toAccountId,
          amount: amount,
          type: "TRANSFER",
          direction: "CREDIT",
          status: "COMPLETED",
          description: description || `Transfer from ${sender.accountNumber}`,
         referenceId: `${baseRef}-IN`,
         metadata: { relatedAccountId: fromAccountId, baseRef },
        },
      });

     return { success: true, referenceId: baseRef };
    });
  },
};