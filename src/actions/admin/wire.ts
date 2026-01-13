'use server';

import { db } from "@/lib/db";
import { logAdminAction } from "@/lib/admin-logger";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/admin-auth";


// GENERATE CODES
const generateCode = (prefix: string) => {
    return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
};

// 1. SET CLEARANCE CODE
export async function adminSetWireCode(formData: FormData) {
    const { authorized } = await checkAdminAction();
    if (!authorized) return { success: false, message: "Unauthorized" };

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
    const { authorized } = await checkAdminAction();
    if (!authorized) return { success: false, message: "Unauthorized" };

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

        await logAdminAction("REJECT_WIRE", wireId, { reason: "Admin rejected" });

        revalidatePath("/admin/wires");
        return { success: true, message: "Wire Rejected & Refunded" };
    } catch (error) {
        return { success: false, message: "Refund Failed" };
    }
}

// 3. COMPLETE WIRE (Finalize & Sync Balances)
export async function adminCompleteWire(wireId: string) {
    const { authorized } = await checkAdminAction();
    if (!authorized) return { success: false, message: "Unauthorized" };

    try {
        await db.$transaction(async (tx) => {
            const wire = await tx.wireTransfer.findUnique({ where: { id: wireId } });

            if (!wire || ['FAILED', 'COMPLETED'].includes(wire.status)) {
                throw new Error("Wire is already finalized.");
            }

            // A. Update Wire Status
            await tx.wireTransfer.update({
                where: { id: wireId },
                data: {
                    status: 'COMPLETED',
                    currentStage: 'COMPLETED'
                }
            });

            // B. Update Sender's CURRENT Balance
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

        await logAdminAction("APPROVE_WIRE", wireId, { status: "COMPLETED" });

        revalidatePath("/admin/wires");
        return { success: true, message: "Wire Completed & Funds Settled" };

    } catch (error) {
        console.error(error);
        return { success: false, message: "Failed to complete wire" };
    }
}


// 4.GENERATE CLEARANCE CODES
export async function generateClearanceCodes(wireId: string) {
    const { authorized } = await checkAdminAction();
    if (!authorized) return { message: "Unauthorized" };

    const taa = generateCode("TAA");
    const cot = generateCode("COT");
    const ijy = generateCode("IJY");

    await db.wireTransfer.update({
        where: { id: wireId },
        data: {
            taaCode: taa,
            cotCode: cot,
            ijyCode: ijy,
        }
    });

    await logAdminAction("GENERATE_CODES", wireId, { taa, cot, ijy });
    revalidatePath("/admin");
    return {
        message: "Codes Generated",
        codes: { taa, cot, ijy }
    };
}