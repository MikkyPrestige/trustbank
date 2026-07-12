'use server';

import { getAuthenticatedUser } from "@/lib/auth/user-guard";
import { db } from "@/lib/db";
import { checkMaintenanceMode } from "@/lib/security";
import { revalidatePath } from "next/cache";
import { CardStatus, KycStatus } from "@prisma/client";
import { z } from "zod";
import { logSecurityEvent } from "@/lib/utils/security-logger";

const sanitize = (str: string) => str.replace(/<[^>]*>/g, '');
const cardIdSchema = z.string().min(1, "Card ID is required");


export async function toggleCardFreeze(cardId: string) {
  const { success, message, user } = await getAuthenticatedUser();

  if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }

    if (!success || !user) {
        return { message };
    }

    const validatedId = cardIdSchema.safeParse(cardId);
if (!validatedId.success) {
    return { success: false, message: validatedId.error.issues[0].message };
}
const safeCardId = validatedId.data;

let newStatus: CardStatus;

    try {
        if (user.kycStatus !== KycStatus.VERIFIED) {
            return { success: false, message: "Action denied. Identity verification required." };
        }

          const card = await db.card.findUnique({
        where: { id: safeCardId, userId: user.id }
    });

    if (!card) {
        return { success: false, message: "Card not found." };
    }

    if (card.adminLocked && card.status === CardStatus.BLOCKED) {
        return { success: false, message: "This card was frozen by an administrator. Please contact support to unlock it." };
    }

        newStatus = card.status === CardStatus.ACTIVE ? CardStatus.BLOCKED : CardStatus.ACTIVE;

        await db.$transaction(async (tx) => {
            await tx.card.update({
                where: {
                    id: safeCardId,
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
                          message: `User ${sanitize(user.fullName || 'Client')} has frozen/blocked their card manually.`,
                            type: "WARNING",
                            link: `/admin/users/${user.id}`,
                            isRead: false
                        }))
                    });
                }
            }
        });

        await logSecurityEvent({
  action: newStatus === CardStatus.BLOCKED ? "CARD_FROZEN" : "CARD_UNFROZEN",
  level: "WARNING",
  userId: user.id,
  details: {
    cardId: safeCardId,
    newStatus,
  },
});

    } catch (error) {
        console.error("Card Toggle Error", error);
        return { success: false, message: "Failed to update card status" };
    }

    revalidatePath("/dashboard/cards");

    return { success: true, newStatus: newStatus!};
}