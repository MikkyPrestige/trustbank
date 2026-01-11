'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { checkPermissions } from "@/lib/security";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const wireSchema = z.object({
    accountId: z.string().min(1, "Account is required"),
    amount: z.coerce.number().min(10, "Minimum wire amount is $10"),
    pin: z.string().length(4, "PIN must be 4 digits"),
    bankName: z.string().min(3, "Bank Name is required"),
    accountNumber: z.string().min(6, "Invalid Account Number"),
    swiftCode: z.string().min(3, "SWIFT/BIC Code is required"),
    country: z.string().min(2, "Country is required"),
    routingNumber: z.string().optional(),
    note: z.string().optional(),
    saveBeneficiary: z.string().optional(),
});

export async function initiateWireTransfer(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    const rawData = Object.fromEntries(formData.entries());
    const validated = wireSchema.safeParse(rawData);

    if (!validated.success) {
        return { message: "Please check your inputs." };
    }

    const {
        accountId, amount, pin, bankName, accountNumber,
        swiftCode, country, saveBeneficiary
    } = validated.data;

    // 1. Security Check
    const permission = await checkPermissions(session.user.id, 'TRANSFER', amount);
    if (!permission.allowed) {
        return { message: `🚫 ${permission.error}` };
    }

    try {
        const user = await db.user.findUnique({ where: { id: session.user.id } });
        if (!user || user.transactionPin !== pin) {
            return { message: "Incorrect Transaction PIN." };
        }

        const account = await db.account.findUnique({ where: { id: accountId } });
        if (!account) return { message: "Account not found." };
        if (Number(account.availableBalance) < amount) {
            return { message: "Insufficient Funds." };
        }

        await db.$transaction(async (tx) => {
            // 2. Create Wire Record
            await tx.wireTransfer.create({
                data: {
                    userId: user.id,
                    bankName,
                    accountNumber,
                    swiftCode,
                    country,
                    amount: amount,
                    status: "PENDING_AUTH",
                    currentStage: "TAA",
                }
            });

            // 3. Deduct Balance
            await tx.account.update({
                where: { id: accountId },
                data: { availableBalance: { decrement: amount } }
            });

            // 4. Create Receipt
            await tx.ledgerEntry.create({
                data: {
                    accountId: accountId,
                    amount: amount,
                    direction: "DEBIT",
                    status: "PENDING",
                    description: `Wire Transfer to ${bankName}`,
                    referenceId: "WIRE-" + Date.now(),
                    type: "WIRE"
                }
            });

            // 👇 5. SAVE BENEFICIARY (New Logic)
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
                            accountName: bankName, // Wire often uses Bank Name as the main identifier
                            accountNumber: accountNumber,
                            bankName: bankName,
                            swiftCode: swiftCode,
                        }
                    });
                }
            }
        });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/beneficiaries");

        return { success: true, message: "Wire Initiated Successfully." };

    } catch (err) {
        console.error("Wire Error:", err);
        return { message: "Transaction failed. Please try again." };
    }
}