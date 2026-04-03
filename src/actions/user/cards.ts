'use server';

import { getAuthenticatedUser } from "@/lib/auth/user-guard";
import { db } from "@/lib/db";
import { checkMaintenanceMode } from "@/lib/security";
import { revalidatePath } from "next/cache";
import { CardStatus, KycStatus } from "@prisma/client";

export async function toggleCardFreeze(cardId: string, currentStatus: string) {
  const { success, message, user } = await getAuthenticatedUser();

  if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }

    if (!success || !user) {
        return { message };
    }

    let newStatus: CardStatus;

    try {
        if (user.kycStatus !== KycStatus.VERIFIED) {
            return { success: false, message: "Action denied. Identity verification required." };
        }

        const isActive = currentStatus === CardStatus.ACTIVE;
        newStatus = isActive ? CardStatus.BLOCKED : CardStatus.ACTIVE;

        await db.$transaction(async (tx) => {
            await tx.card.update({
                where: {
                    id: cardId,
                    userId: user.id
                },
                data: { status: newStatus }
            });

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
        });

    } catch (error) {
        console.error("Card Toggle Error", error);
        return { success: false, message: "Failed to update card status" };
    }

    revalidatePath("/dashboard/cards");

    return { success: true, newStatus: newStatus! };
}