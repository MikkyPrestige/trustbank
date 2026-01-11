'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleCardFreeze(cardId: string, currentStatus: string) {
    const session = await auth();
    if (!session) return { success: false, message: "Unauthorized" };

    try {
        // Toggle logic: If ACTIVE -> FROZEN, If FROZEN -> ACTIVE
        const newStatus = currentStatus === "ACTIVE" ? "FROZEN" : "ACTIVE";

        await db.card.update({
            where: {
                id: cardId,
                userId: session.user.id // Security check: Ensure user owns card
            },
            data: { status: newStatus }
        });

        revalidatePath("/dashboard/card");
        return { success: true, newStatus };
    } catch (error) {
        console.error("Card Toggle Error", error);
        return { success: false, message: "Failed to update card status" };
    }
}