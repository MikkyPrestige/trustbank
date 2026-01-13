'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function submitClearanceCode(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { message: "Unauthorized" };

  const code = formData.get("code") as string;
  const wireId = formData.get("wireId") as string;

  if (!code) return { message: "Please enter the code." };

  try {
    const wire = await db.wireTransfer.findUnique({
      where: { id: wireId, userId: session.user.id }
    });

    if (!wire) return { message: "Transaction not found." };
    if (['FAILED', 'COMPLETED'].includes(wire.status)) {
        return { message: `Transaction is already ${wire.status.toLowerCase()}.` };
    }

    // 1. DETERMINE REQUIRED CODE BASED ON STAGE
    let requiredCode = "";
    let nextStage = "";
    let isFinalStage = false;

    if (wire.currentStage === 'TAA') {
        requiredCode = wire.taaCode || "";
        nextStage = 'COT';
    } else if (wire.currentStage === 'COT') {
        requiredCode = wire.cotCode || "";
        nextStage = 'IJY';
    } else if (wire.currentStage === 'IJY') {
        requiredCode = wire.ijyCode || "";
        isFinalStage = true;
    }

    // 2. CHECK IF CODE IS WRONG
    if (code !== requiredCode) {
        // Increment attempts
        const attempts = wire.failedAttempts + 1;

        // 🚨 STRIKE 3: AUTO-FAIL & REFUND
        if (attempts >= 5) {
            await db.$transaction(async (tx) => {
                // A. Fail the Wire
                await tx.wireTransfer.update({
                    where: { id: wireId },
                    data: {
                        status: 'FAILED',
                        failedAttempts: attempts
                    }
                });

                // B. Refund the Money (Increase Available Balance)
                // We do NOT touch Current Balance because it never left.
                if (wire.accountId) {
                    await tx.account.update({
                        where: { id: wire.accountId },
                        data: { availableBalance: { increment: wire.amount } }
                    });
                } else {
                    // Fallback
                    const account = await tx.account.findFirst({ where: { userId: wire.userId } });
                    if (account) {
                         await tx.account.update({
                            where: { id: account.id },
                            data: { availableBalance: { increment: wire.amount } }
                        });
                    }
                }
            });

            revalidatePath("/dashboard/wire");
            return { success: false, message: "❌ Too many failed attempts. Transaction cancelled and funds refunded." };
        }

        // JUST A STRIKE (1 or 2)
        await db.wireTransfer.update({
            where: { id: wireId },
            data: { failedAttempts: attempts }
        });

        return { success: false, message: `Invalid Code. ${5 - attempts} attempts remaining.` };
    }

    // 3. SUCCESS LOGIC (Code Matched)
    if (isFinalStage) {
        // IJY Completed -> Finalize Transaction
        await db.$transaction(async (tx) => {
            await tx.wireTransfer.update({
                where: { id: wireId },
                data: { currentStage: 'COMPLETED', status: 'COMPLETED' }
            });

            // Deduct Current Balance (Sync Books)
            if (wire.accountId) {
                await tx.account.update({
                    where: { id: wire.accountId },
                    data: { currentBalance: { decrement: wire.amount } }
                });
            } else {
                const account = await tx.account.findFirst({ where: { userId: wire.userId } });
                if (account) {
                    await tx.account.update({
                        where: { id: account.id },
                        data: { currentBalance: { decrement: wire.amount } }
                    });
                }
            }
        });
    } else {
        // Move to Next Stage (TAA -> COT -> IJY)
        await db.wireTransfer.update({
            where: { id: wireId },
            data: { currentStage: nextStage }
        });
    }

    revalidatePath("/dashboard/wire/status");
    return { success: true, message: "Code Accepted." };

  } catch (error) {
    console.error(error);
    return { message: "Verification failed." };
  }
}