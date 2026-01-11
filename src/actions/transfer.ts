'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { checkPermissions } from "@/lib/security";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const transferSchema = z.object({
    sourceAccountId: z.string(),
    amount: z.coerce.number().min(1, "Minimum transfer is $1"),
    pin: z.string().length(4, "PIN must be 4 digits"),
    accountName: z.string().min(1, "Name is required"),
    accountNumber: z.string().min(6, "Invalid Account Number"),
    bankName: z.string().min(1, "Bank Name is required"),
    swiftCode: z.string().optional(),
    note: z.string().optional(),
    saveBeneficiary: z.string().optional(),
});

export async function processTransfer(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    const rawData = Object.fromEntries(formData.entries());
    const validated = transferSchema.safeParse(rawData);

    if (!validated.success) {
        return { message: "Please check your inputs." };
    }

    const {
        sourceAccountId, amount, pin, accountName,
        accountNumber, bankName, saveBeneficiary, note
    } = validated.data;

    // 1. Security Check
    const permission = await checkPermissions(session.user.id, 'TRANSFER', amount);
    if (!permission.allowed) {
        return { message: `🚫 ${permission.error}` };
    }

    try {
        // 2. Verify User & PIN
        const user = await db.user.findUnique({ where: { id: session.user.id } });
        if (!user || user.transactionPin !== pin) {
            return { message: "Incorrect Transaction PIN." };
        }

        // 3. Get Source Account
        const sourceAccount = await db.account.findUnique({ where: { id: sourceAccountId } });
        if (!sourceAccount) return { message: "Account not found." };
        if (sourceAccount.userId !== user.id) return { message: "Unauthorized account." };

        // 4. Check Balance
        if (Number(sourceAccount.availableBalance) < amount) {
            return { message: "Insufficient Funds." };
        }

        // 5. Check Internal Destination
        const destinationAccount = await db.account.findUnique({
            where: { accountNumber: accountNumber }
        });

        // 6. EXECUTE TRANSFER
        await db.$transaction(async (tx) => {

            // A. DEDUCT FROM SENDER
            await tx.account.update({
                where: { id: sourceAccountId },
                data: { availableBalance: { decrement: amount } }
            });

            // Sender's Receipt (Now including the Note)
            const senderDesc = `Transfer to ${accountName}` + (note ? ` - ${note}` : ``);

            await tx.ledgerEntry.create({
                data: {
                    accountId: sourceAccountId,
                    amount: amount,
                    direction: "DEBIT",
                    status: "COMPLETED",
                    type: "TRANSFER",
                    description: senderDesc, // <--- NOTE ADDED HERE
                    referenceId: "TRX-" + Math.floor(Math.random() * 100000000),
                }
            });

            // B. CREDIT RECEIVER (Only if Internal)
            if (destinationAccount) {
                await tx.account.update({
                    where: { id: destinationAccount.id },
                    data: { availableBalance: { increment: amount } }
                });

                // Receiver's Receipt
                const receiverDesc = `Received from ${user.fullName}` + (note ? ` - ${note}` : ``);

                await tx.ledgerEntry.create({
                    data: {
                        accountId: destinationAccount.id,
                        amount: amount,
                        direction: "CREDIT",
                        status: "COMPLETED",
                        type: "DEPOSIT",
                        description: receiverDesc, // <--- NOTE ADDED HERE
                        referenceId: "RCV-" + Math.floor(Math.random() * 100000000),
                    }
                });
            }

            // C. SAVE BENEFICIARY
            if (saveBeneficiary === "on") {
                const existing = await tx.beneficiary.findFirst({
                    where: {
                        userId: session.user.id,
                        accountNumber: accountNumber
                    }
                });

                if (!existing) {
                    await tx.beneficiary.create({
                        data: {
                            userId: session.user.id,
                            accountName: accountName,
                            accountNumber: accountNumber,
                            bankName: bankName,
                        }
                    });
                }
            }
        });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/beneficiaries");

        return { success: true, message: "Transfer Successful!" };

    } catch (err) {
        console.error("Transfer Error:", err);
        return { message: "Transfer failed. Please try again." };
    }
}