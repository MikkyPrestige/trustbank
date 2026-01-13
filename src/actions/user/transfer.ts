'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { checkPermissions, verifyPin } from "@/lib/security";
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
    if (!session?.user?.id) return { message: "Unauthorized" };

    const rawData = Object.fromEntries(formData.entries());
    const validated = transferSchema.safeParse(rawData);

    if (!validated.success) {
        return { message: "Please check your inputs." };
    }

    const {
        sourceAccountId, amount, pin, accountName,
        accountNumber, bankName, saveBeneficiary, note
    } = validated.data;

    // 🔒 1. SECURITY: Verify PIN & Check Rate Limit
    const pinValidation = await verifyPin(session.user.id, pin);
    if (!pinValidation.success) {
        return { message: pinValidation.error };
    }

    // 🔒 2. SECURITY: Role & Action Permissions
    const permission = await checkPermissions(session.user.id, 'TRANSFER', amount);
    if (!permission.allowed) {
        return { message: `🚫 ${permission.error}` };
    }

    try {
        // 3. Fetch User for KYC Check
        const user = await db.user.findUnique({ where: { id: session.user.id } });
        if (!user) return { message: "User not found." };

        // 🛑 NEW: FROZEN ACCOUNT LOCK
        // Frozen users can log in, but cannot move money.
        if (user.status === 'FROZEN') {
            return { message: "🚫 Account Frozen. Please contact support to unlock transfers." };
        }

        // 4. KYC Limit Check
        const isVerified = user.kycStatus === 'VERIFIED';
        const UNVERIFIED_LIMIT = 2000;

        if (!isVerified && amount > UNVERIFIED_LIMIT) {
            return { message: `🚫 Unverified Limit Exceeded. You can only send up to $${UNVERIFIED_LIMIT}.` };
        }

        // 5. Get Source Account
        const sourceAccount = await db.account.findUnique({ where: { id: sourceAccountId } });
        if (!sourceAccount) return { message: "Account not found." };
        if (sourceAccount.userId !== user.id) return { message: "Unauthorized account." };

        // 6. Check Balance
        if (Number(sourceAccount.availableBalance) < amount) {
            return { message: "Insufficient Funds." };
        }

        // 7. Check Internal Destination (for internal transfers)
        const destinationAccount = await db.account.findUnique({
            where: { accountNumber: accountNumber }
        });

        // 8. EXECUTE TRANSFER TRANSACTION
        await db.$transaction(async (tx) => {

            // A. DEDUCT FROM SENDER (Both Balances)
            await tx.account.update({
                where: { id: sourceAccountId },
                data: {
                    availableBalance: { decrement: amount },
                    currentBalance: { decrement: amount }
                }
            });

            // Sender's Receipt
            const senderDesc = `Transfer to ${accountName}` + (note ? ` - ${note}` : ``);

            await tx.ledgerEntry.create({
                data: {
                    accountId: sourceAccountId,
                    amount: amount,
                    direction: "DEBIT",
                    status: "COMPLETED",
                    type: "TRANSFER",
                    description: senderDesc,
                    referenceId: "TRX-" + Math.floor(Math.random() * 100000000),
                }
            });

            // B. CREDIT RECEIVER (Only if Internal Account exists in DB)
            if (destinationAccount) {
                await tx.account.update({
                    where: { id: destinationAccount.id },
                    data: {
                        availableBalance: { increment: amount },
                        currentBalance: { increment: amount }
                    }
                });

                const receiverDesc = `Received from ${user.fullName}` + (note ? ` - ${note}` : ``);

                await tx.ledgerEntry.create({
                    data: {
                        accountId: destinationAccount.id,
                        amount: amount,
                        direction: "CREDIT",
                        status: "COMPLETED",
                        type: "DEPOSIT",
                        description: receiverDesc,
                        referenceId: "RCV-" + Math.floor(Math.random() * 100000000),
                    }
                });
            }

            // C. SAVE BENEFICIARY (Optional)
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