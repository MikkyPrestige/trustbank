'use server';

import { getAuthenticatedUser } from "@/lib/auth/user-guard";
import { db } from "@/lib/db";
import { checkMaintenanceMode, checkPermissions, verifyPin } from "@/lib/security";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  KycStatus,
  TransactionStatus,
  TransactionType,
  TransactionDirection
} from "@prisma/client";

// --- 1. FEE CALCULATOR ---
function calculateWireFee(amount: number): number {
    if (amount <= 5000) return 25.00;
    if (amount <= 50000) return 50.00;
    return 100.00;
}

const wireSchema = z.object({
  accountId: z.string().min(1, "Account Selection is required"),
  amount: z.coerce.number().min(100, "Minimum wire amount is $100"),
  pin: z.string().length(4, "PIN must be 4 digits"),
  bankName: z.string().min(3, "Bank Name is required"),
  accountName: z.string().min(3, "Account Name is required"),
  accountNumber: z.string().min(6, "Invalid Account Number"),
  country: z.string().min(2, "Country is required"),
  swiftCode: z.string().optional(),
  routingNumber: z.string().optional(),
  saveBeneficiary: z.string().optional(),
});

export async function initiateWireTransfer(prevState: any, formData: FormData) {
  // 1. GUARD
  const { success, message, user } = await getAuthenticatedUser();
   if (!success || !user) {
        return { success: false, message };
    }

    if (await checkMaintenanceMode()) {
       return { success: false, message: "Transaction failed: System is in maintenance mode." };
   }

  const rawData = {
    accountId: formData.get("accountId")?.toString() || "",
    amount: formData.get("amount")?.toString() || "",
    pin: formData.get("pin")?.toString() || "",
    bankName: formData.get("bankName")?.toString() || "",
    accountName: formData.get("accountName")?.toString() || "",
    accountNumber: formData.get("accountNumber")?.toString() || "",
    country: formData.get("country")?.toString() || "",
    swiftCode: formData.get("swiftCode")?.toString() || undefined,
    routingNumber: formData.get("routingNumber")?.toString() || undefined,
    saveBeneficiary: formData.get("saveBeneficiary")?.toString() || undefined,
  };

  const validated = wireSchema.safeParse(rawData);

  if (!validated.success) {
    return { message: validated.error.issues[0].message };
  }

  const {
    accountId, amount, pin, bankName, accountNumber, accountName,
    swiftCode, country, routingNumber, saveBeneficiary
  } = validated.data;

  // 2. LOGIC & COMPLIANCE

  // A. Routing/SWIFT Check
  if (!swiftCode && !routingNumber) {
      return { message: "Please provide either a SWIFT Code (Intl) or Routing Number (US)." };
  }

  // B. Internal Transfer Check
  const internalAccount = await db.account.findUnique({
      where: { accountNumber: accountNumber }
  });
  if (internalAccount) {
      return { message: "TrustBank Account detected. Please use 'Local Transfer' for instant, fee-free transactions." };
  }

  // C. Calculate Fee
  const serviceFee = calculateWireFee(amount);
  const totalDeduction = amount + serviceFee;

  // 3. SECURITY & LIMITS
  const pinValidation = await verifyPin(user.id, pin);
  if (!pinValidation.success) return { message: pinValidation.error };

const permission = await checkPermissions(user.id, 'TRANSFER_WIRE', amount);
    if (!permission.allowed) {
        return { message: `🚫 ${permission.error}` };
    }

  const isVerified = user.kycStatus === KycStatus.VERIFIED;
  const UNVERIFIED_LIMIT = 2000;

  if (!isVerified && amount > UNVERIFIED_LIMIT) {
    return { message: `🚫 Unverified Limit Exceeded. Max: $${UNVERIFIED_LIMIT.toLocaleString()}.` };
  }

  // 4. BALANCE CHECK (Must cover Amount + Fee)
  const account = await db.account.findUnique({ where: { id: accountId } });
  if (!account) return { message: "Account not found." };

  if (Number(account.availableBalance) < totalDeduction) {
      return { message: `Insufficient funds. Balance needed: $${totalDeduction.toLocaleString()} (Includes $${serviceFee} fee).` };
  }

  // 5. THE TRANSACTION
  try {
    let transactionResult: any = null;

    await db.$transaction(async (tx) => {
      // A. Create Wire Record
      const wire = await tx.wireTransfer.create({
        data: {
          userId: user.id,
          accountId: accountId,
          bankName,
          accountNumber,
          accountName,
          country,
          amount: amount,
          fee: serviceFee,
          status: TransactionStatus.ON_HOLD,
          currentStage: "TAA",
          swiftCode: swiftCode || undefined,
          routingNumber: routingNumber || undefined,
        }
      });

      // B. Deduct AVAILABLE Balance Only (The Lock)
      await tx.account.update({
        where: { id: accountId },
        data: { availableBalance: { decrement: totalDeduction } }
      });

      // C. Ledger Entry: The Wire (ON HOLD)
      await tx.ledgerEntry.create({
        data: {
          accountId: accountId,
          amount: amount,
          type: TransactionType.WIRE,
          direction: TransactionDirection.DEBIT,
          status: TransactionStatus.ON_HOLD,
          description: `Authorization Hold: Wire to ${bankName}`,
          referenceId: "WIRE-" + wire.id,
        }
      });

      // D. Beneficiary
      if (saveBeneficiary === "on") {
        const existing = await tx.beneficiary.findFirst({
          where: { userId: user.id, accountNumber: accountNumber }
        });

        if (!existing) {
          await tx.beneficiary.create({
            data: {
              userId: user.id,
              accountName: accountName,
              bankName: bankName,
              accountNumber: accountNumber,
              swiftCode: swiftCode || null,
              routingNumber: routingNumber || null,
            }
          });
        }
      }

      transactionResult = wire;
    });

    // 6. NOTIFICATIONS
    if (transactionResult) {
      const admins = await db.user.findMany({
          where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
          select: { id: true }
      });

      if (admins.length > 0) {
          await db.notification.createMany({
              data: admins.map(admin => ({
                  userId: admin.id,
                  title: "New Wire Authorization",
                  message: `${user.fullName || 'User'} requested wire of $${amount.toLocaleString()}. Funds held.`,
                  type: "WARNING",
                  link: `/admin/wires?id=${transactionResult.id}`,
                  isRead: false
              }))
          });
      }
    }

  } catch (err) {
    console.error("Wire Error:", err);
    return { message: "Transaction failed. Please try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/beneficiaries");

  return { success: true, message: `Wire Authorized. Funds Reserved ($${totalDeduction.toLocaleString()}).` };
}