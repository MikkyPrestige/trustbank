'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleCardFreeze(cardId: string, currentStatus: string) {
    const session = await auth();
    if (!session) return { success: false, message: "Unauthorized" };

    try {
        // 1. Fetch User
        const user = await db.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user) return { success: false, message: "User not found" };

        // 🛑 NEW: FROZEN ACCOUNT LOCK
        // If the entire account is frozen, they cannot manage their cards.
        if (user.status === 'FROZEN') {
            return { success: false, message: "Account Frozen. Card management is disabled." };
        }

        // 🔒 KYC GATEKEEPER
        if (user.kycStatus !== 'VERIFIED') {
            return { success: false, message: "Action denied. Identity verification required." };
        }

        // Toggle logic: If ACTIVE -> FROZEN, If FROZEN -> ACTIVE
        const newStatus = currentStatus === "ACTIVE" ? "FROZEN" : "ACTIVE";

        await db.card.update({
            where: {
                id: cardId,
                userId: session.user.id
            },
            data: { status: newStatus }
        });

        revalidatePath("/dashboard/cards");
        return { success: true, newStatus };

    } catch (error) {
        console.error("Card Toggle Error", error);
        return { success: false, message: "Failed to update card status" };
    }
}