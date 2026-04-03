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

// --- FEE CALCULATOR (Base USD Logic) ---
function calculateWireFee(amount: number): number {
    if (amount <= 5000) return 25.00;
    if (amount <= 50000) return 50.00;
    return 100.00;
}

const wireSchema = z.object({
  accountId: z.string().min(1, "Account Selection is required"),
  amount: z.coerce.number().min(50, "Minimum wire amount is $50 equivalent"),
  pin: z.string().length(4, "PIN must be 4 digits"),
  bankName: z.string().min(3, "Bank Name is required"),
  accountName: z.string().min(3, "Account Name is required"),
  accountNumber: z.string().min(6, "Invalid Account Number"),
  country: z.string().min(2, "Country is required"),
  swiftCode: z.string().optional(),
  saveBeneficiary: z.string().optional(),
  displayAmount: z.string().optional(),
  displayCurrency: z.string().optional(),
});

export async function initiateWireTransfer(prevState: any, formData: FormData) {
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
    saveBeneficiary: formData.get("saveBeneficiary")?.toString() || undefined,
    displayAmount: formData.get("displayAmount")?.toString(),
    displayCurrency: formData.get("displayCurrency")?.toString(),
  };

  const validated = wireSchema.safeParse(rawData);

  if (!validated.success) {
    return { message: validated.error.issues[0].message };
  }

  const {
    accountId, amount, pin, bankName, accountNumber, accountName,
    swiftCode, country, saveBeneficiary, displayAmount, displayCurrency
  } = validated.data;

  if (!swiftCode) {
      return { message: "Please provide SWIFT Code of the destination bank" };
  }

  const internalAccount = await db.account.findUnique({
      where: { accountNumber: accountNumber }
  });
  if (internalAccount) {
      return { message: "TrustBank Account detected. Please use 'Local Transfer' for instant, fee-free transactions." };
  }

  const serviceFee = calculateWireFee(amount);
  const totalDeduction = amount + serviceFee;

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

  const account = await db.account.findUnique({ where: { id: accountId } });
  if (!account) return { message: "Account not found." };

  if (Number(account.availableBalance) < totalDeduction) {
      return { message: `Insufficient funds. Balance needed: $${totalDeduction.toLocaleString()} (Includes service fee).` };
  }

  try {
    let transactionResult: any = null;

    await db.$transaction(async (tx) => {
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
        }
      });

      await tx.account.update({
        where: { id: accountId },
        data: { availableBalance: { decrement: totalDeduction } }
      });

      await tx.ledgerEntry.create({
        data: {
          accountId: accountId,
          amount: amount,
          type: TransactionType.WIRE,
          direction: TransactionDirection.DEBIT,
          status: TransactionStatus.ON_HOLD,
          description: `Authorization Hold: Wire to ${bankName}`,
          referenceId: "WIRE-" + wire.id,
          metadata: JSON.stringify({ originalAmount: displayAmount, originalCurrency: displayCurrency })
        }
      });

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
            }
          });
        }
      }

      transactionResult = wire;
    });

    if (transactionResult) {
      const formattedAmount = (displayAmount && displayCurrency)
        ? `${displayCurrency} ${Number(displayAmount).toLocaleString()}`
        : `$${amount.toLocaleString()}`;

      const admins = await db.user.findMany({
          where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
          select: { id: true }
      });

      if (admins.length > 0) {
          await db.notification.createMany({
              data: admins.map(admin => ({
                  userId: admin.id,
                  title: "New Wire Authorization",
                  message: `${user.fullName || 'User'} requested wire of ${formattedAmount}. Funds held.`,
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

  return { success: true, message: `Wire Authorized.` };
}



export async function submitClearanceCode(prevState: any, formData: FormData) {
    const { success, message, user } = await getAuthenticatedUser();

    if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }
    if (!success || !user) return { message };

    const code = formData.get("code") as string;
    const wireId = formData.get("wireId") as string;
    const cleanCode = code ? code.trim().toUpperCase() : "";

    if (!cleanCode || !wireId) return { message: "Invalid Request." };

    const wire = await db.wireTransfer.findUnique({
        where: { id: wireId, userId: user.id },
        include: { user: { select: { fullName: true } } }
    });

    if (!wire) return { message: "Transaction not found." };

    const lockedStatuses: TransactionStatus[] = [
        TransactionStatus.FAILED,
        TransactionStatus.COMPLETED,
        TransactionStatus.PENDING_AUTH,
        TransactionStatus.REVERSED
    ];

    if (lockedStatuses.includes(wire.status)) {
        return { message: `Transaction is currently ${wire.status.toLowerCase().replace('_', ' ')}.` };
    }

    let requiredCode = "";
    let nextStage = "";
    let isFinalStage = false;

    if (wire.currentStage === 'TAA') {
        requiredCode = wire.taaCode || "";
        nextStage = 'COT';
    } else if (wire.currentStage === 'COT') {
        requiredCode = wire.cotCode || "";
        nextStage = 'IMF';
    } else if (wire.currentStage === 'IMF') {
        requiredCode = wire.imfCode || "";
        nextStage = 'IJY';
    } else if (wire.currentStage === 'IJY') {
        requiredCode = wire.ijyCode || "";
        isFinalStage = true;
    }

    const isCorrect = requiredCode && (cleanCode === requiredCode.trim().toUpperCase());

    try {
        if (!isCorrect) {
            const attempts = wire.failedAttempts + 1;

            if (attempts >= 5) {
                await db.$transaction(async (tx) => {
                    await tx.wireTransfer.update({
                        where: { id: wireId },
                        data: {
                            status: TransactionStatus.REVERSED,
                            failedAttempts: attempts
                        }
                    });

                    const totalRelease = Number(wire.amount) + Number(wire.fee || 0);

                    if (wire.accountId) {
                        await tx.account.update({
                            where: { id: wire.accountId },
                            data: { availableBalance: { increment: totalRelease } }
                        });

                        await tx.ledgerEntry.updateMany({
                            where: {
                                referenceId: { contains: wire.id },
                                status: { in: [TransactionStatus.ON_HOLD, TransactionStatus.PENDING_AUTH] }
                            },
                            data: {
                                status: TransactionStatus.REVERSED,
                                description: `Security Block: Excessive Failed Codes`
                            }
                        });
                    }

                    const admins = await tx.user.findMany({
                        where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
                        select: { id: true }
                    });

                    if (admins.length > 0) {
                        await tx.notification.createMany({
                            data: admins.map(admin => ({
                                userId: admin.id,
                                title: "Security Alert: Wire Reversed",
                                message: `User ${wire.user.fullName} failed clearance 5 times. System auto-reversed the transaction.`,
                                type: "WARNING",
                                link: `/admin/wires?id=${wireId}`,
                                isRead: false
                            }))
                        });
                    }

                    await tx.notification.create({
                        data: {
                            userId: wire.userId,
                            title: "Transaction Blocked",
                            message: "Security Alert: Too many failed verification attempts. Your transaction has been reversed.",
                            type: "ERROR",
                            link: `/dashboard/wire/status?id=${wireId}`,
                            isRead: false
                        }
                    });
                });

                revalidatePath("/dashboard");
                return { success: false, message: "Security Limit Reached. Transaction Reversed." };

            } else {
                await db.wireTransfer.update({
                    where: { id: wireId },
                    data: { failedAttempts: attempts }
                });
                return { success: false, message: `Invalid Code. ${5 - attempts} attempts remaining.` };
            }

        } else {
            if (isFinalStage) {
                await db.wireTransfer.update({
                    where: { id: wireId },
                    data: {
                        status: TransactionStatus.PENDING_AUTH,
                        currentStage: 'PENDING_APPROVAL'
                    }
                });

                const admins = await db.user.findMany({
                    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
                    select: { id: true }
                });

                if (admins.length > 0) {
                    await db.notification.createMany({
                        data: admins.map(admin => ({
                            userId: admin.id,
                            title: "Action Required: Wire Approval",
                            message: `User ${wire.user.fullName} has passed all checks. Please verify and approve final transfer.`,
                            type: "WARNING",
                            link: `/admin/wires?id=${wireId}`,
                            isRead: false
                        }))
                    });
                }

                return { success: true, message: "Verification Complete. Processing final authorization..." };

            } else {
                await db.wireTransfer.update({
                    where: { id: wireId },
                    data: { currentStage: nextStage }
                });

                revalidatePath(`/dashboard/wire/status?id=${wireId}`);
                return { success: true, message: "Code Accepted. Proceeding..." };
            }
        }
    } catch (err) {
        console.error("Clearance Error:", err);
        return { message: "System error. Please contact support." };
    }
}