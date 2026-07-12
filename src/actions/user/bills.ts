'use server';

import { getAuthenticatedUser } from "@/lib/auth/user-guard";
import { db } from "@/lib/db";
import { z } from "zod";
import { checkMaintenanceMode, verifyPin, checkPermissions } from "@/lib/security";
import { revalidatePath } from "next/cache";
import {
    TransactionType,
    TransactionDirection,
    TransactionStatus
} from "@prisma/client";

const sanitize = (str: string) => str.replace(/<[^>]*>/g, '');

const billSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount must be at least 0.01"),
  provider: z.string().min(1, "Provider is required").max(100),
  accountNumber: z.string().max(50).optional(),
  pin: z.string().length(4, "PIN must be exactly 4 digits"),
  displayAmount: z.string().optional(),
  displayCurrency: z.string().optional(),
});

export async function payBill(prevState: any, formData: FormData) {
    const { success, message, user: sessionUser } = await getAuthenticatedUser();

    if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance." };
    }

    if (!success || !sessionUser) {
        return { message };
    }

    const permission = await checkPermissions(sessionUser.id, 'BILL_PAYMENT');
    if (!permission.allowed) return { success: false, message: `🚫 ${permission.error}` };

// Validate input
const rawData = {
  amount: formData.get("amount")?.toString() || "",
  provider: formData.get("provider") as string,
  accountNumber: formData.get("accountNumber") as string,
  pin: formData.get("pin") as string,
  displayAmount: formData.get("displayAmount") as string,
  displayCurrency: formData.get("displayCurrency") as string,
};

const validated = billSchema.safeParse(rawData);
if (!validated.success) {
  return { success: false, message: validated.error.issues[0].message };
}

const { amount,
    provider: rawProvider,
    accountNumber: rawAccountNumber, pin, displayAmount, displayCurrency
 } = validated.data;

 // Sanitize strings that might be rendered
 const provider = sanitize(rawProvider);
const accountNumber = rawAccountNumber ? sanitize(rawAccountNumber) : undefined;

// Secure PIN verification (with lockout)
const pinValidation = await verifyPin(sessionUser.id, pin);
if (!pinValidation.success) {
  return { success: false, message: pinValidation.error };
}

    try {


        const billTxId = await db.$transaction(async (tx) => {
            const account = await tx.account.findFirst({
                where: { userId: sessionUser.id, type: 'CHECKING' },
                orderBy: { availableBalance: 'desc' }
            });

            if (!account) throw new Error("No checking account available.");

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
                    referenceId: `BILL-${Date.now()}`,
                    metadata: JSON.stringify({ originalAmount: displayAmount, originalCurrency: displayCurrency })
                }
            });

            return billTx.id;
        });

        const formatStr = (displayAmount && displayCurrency)
            ? `${displayCurrency} ${Number(displayAmount).toLocaleString()}`
            : `$${amount.toLocaleString()}`;

        await db.notification.create({
            data: {
                userId: sessionUser.id,
                title: "Bill Payment Successful",
                message: `You successfully paid ${formatStr} to ${provider}.`,
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