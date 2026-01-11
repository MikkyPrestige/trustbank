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

    // THE STATE MACHINE
    // 1. Check TAA
    if (wire.currentStage === 'TAA') {
      // Logic: Code must match what the Admin set (or match a 'master' code for testing)
      if (wire.taaCode !== code) {
         return { message: "Invalid Tax Authentication (TAA) Code." };
      }
      // Advance to next stage
      await db.wireTransfer.update({
        where: { id: wireId },
        data: { currentStage: 'COT' }
      });
    }

    // 2. Check COT
    else if (wire.currentStage === 'COT') {
      if (wire.cotCode !== code) {
        return { message: "Invalid Cost of Transfer (COT) Code." };
      }
      await db.wireTransfer.update({
        where: { id: wireId },
        data: { currentStage: 'IJY' }
      });
    }

    // 3. Check IJY (Final Stage)
    else if (wire.currentStage === 'IJY') {
      if (wire.ijyCode !== code) {
        return { message: "Invalid IMF/Jury (IJY) Code." };
      }

      // COMPLETE THE TRANSACTION
      await db.wireTransfer.update({
        where: { id: wireId },
        data: { currentStage: 'COMPLETED', status: 'COMPLETED' }
      });

      // Update the Ledger to show it's done (Optional: typically we just leave it as is,
      // or update the LedgerEntry status to COMPLETED if you want strict tracking)
    }

    revalidatePath("/dashboard/wire/status");
    return { success: true, message: "Code Accepted." };

  } catch (error) {
    return { message: "Verification failed." };
  }
}