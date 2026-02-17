'use server';

import { getAuthenticatedUser } from "@/lib/auth/user-guard";
import { db } from "@/lib/db";
import { checkMaintenanceMode, checkPermissions, verifyPin, checkInboundLimit } from "@/lib/security";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  KycStatus,
  TransactionStatus,
  TransactionType,
  TransactionDirection
} from "@prisma/client";

const transferSchema = z.object({
  sourceAccountId: z.string(),
  amount: z.coerce.number().min(0.01, "Minimum transfer is 0.01"),
  pin: z.string().length(4, "PIN must be 4 digits"),
  accountName: z.string().min(1, "Name is required"),
  accountNumber: z.string().min(6, "Invalid Account Number"),
  bankName: z.string().min(1, "Bank Name is required"),
  routingNumber: z.string().optional(),
  note: z.string().optional(),
  saveBeneficiary: z.string().optional(),
  displayAmount: z.string().optional(),
  displayCurrency: z.string().optional(),
});

export async function processTransfer(prevState: any, formData: FormData) {
   const { success, message, user } = await getAuthenticatedUser();

   if (!success || !user) {
        return { success: false, message };
    }

    if (await checkMaintenanceMode()) {
       return { success: false, message: "Transaction failed: System is in maintenance mode." };
   }

    const rawData = Object.fromEntries(formData.entries());
    const validated = transferSchema.safeParse(rawData);

    if (!validated.success) {
       return { message: validated.error.issues[0].message };
    }

    const {
        sourceAccountId, amount, pin, accountName,
        accountNumber, bankName, saveBeneficiary, note, routingNumber,
        displayAmount, displayCurrency
    } = validated.data;

    // 1. SECURITY: Verify PIN
    const pinValidation = await verifyPin(user.id, pin);
    if (!pinValidation.success) {
        return { message: pinValidation.error };
    }

    // 2. SECURITY: Role & Action Permissions (Sender Limits)
    const permission = await checkPermissions(user.id, 'TRANSFER_INTERNAL', amount);
    if (!permission.allowed) {
        return { message: `🚫 ${permission.error}` };
    }

    // 3. PRE-TRANSACTION CHECKS
    const isVerified = user.kycStatus === KycStatus.VERIFIED;
    const UNVERIFIED_LIMIT = 2000;

    if (!isVerified && amount > UNVERIFIED_LIMIT) {
        return { message: `🚫 Unverified Limit Exceeded. Max: $${UNVERIFIED_LIMIT}.` };
    }

    const sourceAccount = await db.account.findUnique({ where: { id: sourceAccountId } });
    if (!sourceAccount) return { message: "Account not found." };
    if (sourceAccount.userId !== user.id) return { message: "Unauthorized account." };

    if (Number(sourceAccount.availableBalance) < amount) {
        return { message: "Insufficient Funds." };
    }

    const destinationAccount = await db.account.findUnique({
        where: { accountNumber: accountNumber }
    });

    // 4. INBOUND LIMIT CHECK
    if (destinationAccount) {
        const inboundCheck = await checkInboundLimit(destinationAccount.userId, amount);
        if (!inboundCheck.allowed) {
            return { message: `🚫 Recipient Cannot Accept Funds: ${inboundCheck.error}` };
        }
    }

    // 5. THE TRANSACTION
    try {
        type TxResult = {
            senderTxId: string;
            receiverTxId?: string;
            destUserId?: string;
        };

        const result: TxResult = await db.$transaction(async (tx) => {

            // A. DEDUCT FROM SENDER
            await tx.account.update({
                where: { id: sourceAccountId },
                data: {
                    availableBalance: { decrement: amount },
                    currentBalance: { decrement: amount }
                }
            });

            const senderRefId = "TRX-" + Math.floor(Math.random() * 100000000);
            const senderDesc = `Transfer to ${accountName}` + (note ? ` - ${note}` : ``);

            const senderTx = await tx.ledgerEntry.create({
                data: {
                    accountId: sourceAccountId,
                    amount: amount,
                    direction: TransactionDirection.DEBIT,
                    status: TransactionStatus.COMPLETED,
                    type: TransactionType.TRANSFER,
                    description: senderDesc,
                    referenceId: senderRefId,
                    metadata: JSON.stringify({ originalAmount: displayAmount, originalCurrency: displayCurrency })
                }
            });

            let receiverTxId: string | undefined;
            let destUserId: string | undefined;

            // B. CREDIT RECEIVER (If Internal)
            if (destinationAccount) {
                destUserId = destinationAccount.userId;

                await tx.account.update({
                    where: { id: destinationAccount.id },
                    data: {
                        availableBalance: { increment: amount },
                        currentBalance: { increment: amount }
                    }
                });

                const receiverRefId = "RCV-" + Math.floor(Math.random() * 100000000);
                const receiverDesc = `Received from ${user.fullName}` + (note ? ` - ${note}` : ``);

                const receiverTx = await tx.ledgerEntry.create({
                    data: {
                        accountId: destinationAccount.id,
                        amount: amount,
                        direction: TransactionDirection.CREDIT,
                        status: TransactionStatus.COMPLETED,
                        type: TransactionType.TRANSFER,
                        description: receiverDesc,
                        referenceId: receiverRefId,
                    }
                });

                receiverTxId = receiverTx.id;
            }

            // C. SAVE BENEFICIARY
            if (saveBeneficiary === "on") {
                const existing = await tx.beneficiary.findFirst({
                    where: { userId: user.id, accountNumber: accountNumber }
                });

                if (!existing) {
                    await tx.beneficiary.create({
                        data: {
                            userId: user.id,
                            accountName: accountName,
                            accountNumber: accountNumber,
                            bankName: bankName,
                            routingNumber: routingNumber || null,
                        }
                    });
                }
            }

            return {
                senderTxId: senderTx.id,
                receiverTxId,
                destUserId
            };
        });

        // 6. NOTIFICATIONS
        const notificationAmount = (displayAmount && displayCurrency)
            ? `${displayCurrency} ${Number(displayAmount).toLocaleString()}`
            : `$${amount.toLocaleString()}`;

        // A. Notify Sender
        await db.notification.create({
            data: {
                userId: user.id,
                title: "Transfer Sent",
                message: `You successfully sent ${notificationAmount} to ${accountName}.`,
                type: "SUCCESS",
                link: `/dashboard/transactions/${result.senderTxId}`,
                isRead: false
            }
        });

        // B. Notify Receiver
        if (result.destUserId && result.receiverTxId && result.destUserId !== user.id) {
            await db.notification.create({
                data: {
                    userId: result.destUserId,
                    title: "Money Received",
                    message: `You received $${amount.toLocaleString()} (approx) from ${user.fullName}.`,
                    type: "SUCCESS",
                    link: `/dashboard/transactions/${result.receiverTxId}`,
                    isRead: false
                }
            });
        }

        // C. Notify Admins
        const admins = await db.user.findMany({
            where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
            select: { id: true }
        });

        if (admins.length > 0) {
            await db.notification.createMany({
                data: admins.map((admin) => ({
                    userId: admin.id,
                    title: "Local Transfer Alert",
                    message: `User ${user.fullName} transferred $${amount.toLocaleString()} to ${accountName} (${bankName}).`,
                    type: "INFO",
                    link: `/admin/users/${user.id}`,
                    isRead: false
                }))
            });
        }

    } catch (err) {
        console.error("Transaction Error:", err);
        return { message: "Transfer failed. Please try again." };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/beneficiaries");

    return { success: true, message: "Transfer Successful!" };
}