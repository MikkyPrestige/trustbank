'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// 1. SET CLEARANCE CODE
export async function adminSetWireCode(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { success: false, message: "Unauthorized" };

    const wireId = formData.get("wireId") as string;
    const stage = formData.get("stage") as string;
    const code = formData.get("code") as string;

    if (!code) return { success: false, message: "Code is required" };

    try {
        const updateData: any = {};
        if (stage === 'TAA') updateData.taaCode = code;
        if (stage === 'COT') updateData.cotCode = code;
        if (stage === 'IJY') updateData.ijyCode = code;

        await db.wireTransfer.update({
            where: { id: wireId },
            data: updateData
        });

        revalidatePath("/admin/wires");
        return { success: true, message: `${stage} Code Updated!` };
    } catch (error) {
        return { success: false, message: "Failed to update code" };
    }
}

// 2. REJECT & REFUND
export async function adminRejectWire(wireId: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { success: false, message: "Unauthorized" };

    try {
        await db.$transaction(async (tx) => {
            const wire = await tx.wireTransfer.findUnique({ where: { id: wireId } });
            if (!wire || ['FAILED', 'COMPLETED'].includes(wire.status)) throw new Error("Invalid wire status");

            // Refund Account
            const account = await tx.account.findFirst({ where: { userId: wire.userId } });
            if (account) {
                await tx.account.update({
                    where: { id: account.id },
                    data: { availableBalance: { increment: wire.amount } }
                });
            }

            // Mark Failed
            await tx.wireTransfer.update({
                where: { id: wireId },
                data: { status: 'FAILED' }
            });
        });

        revalidatePath("/admin/wires");
        return { success: true, message: "Wire Rejected & Refunded" };
    } catch (error) {
        return { success: false, message: "Refund Failed" };
    }
}