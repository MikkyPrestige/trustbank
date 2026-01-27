'use server';

import { getAuthenticatedUser } from "@/lib/auth/user-guard";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { CardStatus, KycStatus } from "@prisma/client";

export async function toggleCardFreeze(cardId: string, currentStatus: string) {
  const { success, message, user } = await getAuthenticatedUser();

    if (!success || !user) {
        return { message };
    }

    let newStatus: CardStatus;

    try {
        // 🔒 KYC GATEKEEPER
        if (user.kycStatus !== KycStatus.VERIFIED) {
            return { success: false, message: "Action denied. Identity verification required." };
        }

        // Toggle logic
        const isActive = currentStatus === CardStatus.ACTIVE;
        newStatus = isActive ? CardStatus.BLOCKED : CardStatus.ACTIVE;

        // 👇 CHANGED: Wrapped in transaction to notify Admins
        await db.$transaction(async (tx) => {
            // A. Update Card Status
            await tx.card.update({
                where: {
                    id: cardId,
                    userId: user.id
                },
                data: { status: newStatus }
            });

            // 👇 NEW: NOTIFY ADMINS IF CARD IS FROZEN (BLOCKED)
            // We only notify on freeze (BLOCKED), usually less critical if they unfreeze,
            // but you can remove the "if" to notify on both.
            if (newStatus === CardStatus.BLOCKED) {
                const admins = await tx.user.findMany({
                    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
                    select: { id: true }
                });

                if (admins.length > 0) {
                    await tx.notification.createMany({
                        data: admins.map((admin) => ({
                            userId: admin.id,
                            title: "Card Security Alert",
                            message: `User ${user.fullName || 'Client'} has frozen/blocked their card manually.`,
                            type: "WARNING",
                            link: `/admin/users/${user.id}`,
                            isRead: false
                        }))
                    });
                }
            }
            // 👆 END NEW CODE
        });

    } catch (error) {
        console.error("Card Toggle Error", error);
        return { success: false, message: "Failed to update card status" };
    }

    // ✅ Revalidate outside try/catch
    revalidatePath("/dashboard/cards");

    return { success: true, newStatus: newStatus! }; // Use ! assertion since it's definitely assigned inside try
}