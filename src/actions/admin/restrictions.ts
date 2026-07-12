'use server';

import { db } from "@/lib/db";
import { logAdminAction } from "@/lib/utils/admin-logger";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { canPerform } from "@/lib/auth/permissions";
import { UserRole, CardStatus } from "@prisma/client";
import { z } from "zod";
import { logSecurityEvent } from "@/lib/utils/security-logger";
import { createSupportTicket } from "@/actions/admin/support";

const sanitize = (str: string) => str.replace(/<[^>]*>/g, '');

const SERVICE_LABELS: Record<string, string> = {
    CRYPTO: "Crypto Trading",
    BILLS: "Bill Payments",
    LOANS: "Loans",
};

const serviceRestrictionSchema = z.object({
    userId: z.string().min(1, "User is required"),
    service: z.enum(['CRYPTO', 'BILLS', 'LOANS']),
    restricted: z.enum(['true', 'false']),
    reason: z.string().max(500).optional(),
    notifyViaTicket: z.string().optional(),
});

export async function adminSetServiceRestriction(formData: FormData) {
    const { authorized, session } = await checkAdminAction();
    if (!authorized || !session || !session.user) return { success: false, message: "Unauthorized" };
    if (!canPerform(session.user.role as UserRole, 'MONEY')) return { success: false, message: "Insufficient permissions." };

    const rawData = {
        userId: formData.get("userId") as string,
        service: formData.get("service") as string,
        restricted: formData.get("restricted") as string,
        reason: formData.get("reason") as string || undefined,
        notifyViaTicket: formData.get("notifyViaTicket") as string || undefined,
    };

    const parsed = serviceRestrictionSchema.safeParse(rawData);
    if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };

    const { userId, service, notifyViaTicket } = parsed.data;
    const restricted = parsed.data.restricted === 'true';
    const safeReason = parsed.data.reason ? sanitize(parsed.data.reason) : undefined;
    const label = SERVICE_LABELS[service];

    try {
        const targetUser = await db.user.findUnique({ where: { id: userId } });
        if (!targetUser) return { success: false, message: "User not found." };
        if (targetUser.role === UserRole.SUPER_ADMIN) return { success: false, message: "Cannot restrict Super Admin." };

        const updateData: any = {};
        if (service === 'CRYPTO') {
            updateData.cryptoRestricted = restricted;
            updateData.cryptoRestrictedReason = restricted ? (safeReason || null) : null;
        } else if (service === 'BILLS') {
            updateData.billsRestricted = restricted;
            updateData.billsRestrictedReason = restricted ? (safeReason || null) : null;
        } else if (service === 'LOANS') {
            updateData.loansRestricted = restricted;
            updateData.loansRestrictedReason = restricted ? (safeReason || null) : null;
        }

        await db.user.update({ where: { id: userId }, data: updateData });

        await db.notification.create({
            data: {
                userId,
                title: restricted ? `${label} Access Restricted` : `${label} Access Restored`,
                message: restricted
                    ? (safeReason ? `Your access to ${label} has been restricted: ${safeReason}` : `Your access to ${label} has been restricted by an administrator.`)
                    : `Your access to ${label} has been restored.`,
                type: restricted ? "WARNING" : "SUCCESS",
                link: "/dashboard/support",
                isRead: false
            }
        });

        if (restricted && notifyViaTicket === 'on') {
            await createSupportTicket(
                userId,
                `${label} Access Restricted`,
                safeReason || `Your access to ${label} has been restricted. Please reply here if you have any questions.`,
                session.user.email || "Admin"
            );
        }

        await logAdminAction(
            restricted ? "RESTRICT_SERVICE" : "UNRESTRICT_SERVICE",
            userId,
            { service, reason: safeReason, admin: session.user.email },
            restricted ? "WARNING" : "INFO",
            "SUCCESS"
        );

        await logSecurityEvent({
            action: restricted ? "ADMIN_RESTRICT_SERVICE" : "ADMIN_UNRESTRICT_SERVICE",
            level: restricted ? "WARNING" : "INFO",
            details: { targetUserId: userId, service, reason: safeReason, adminEmail: session.user.email },
            adminId: session.user.id,
            userId,
        });

    } catch (err) {
        console.error("Service Restriction Error:", err);
        return { success: false, message: "Failed to update service access." };
    }

    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/users");
    return { success: true, message: restricted ? `${label} access restricted.` : `${label} access restored.` };
}

const cardFreezeSchema = z.object({
    cardId: z.string().min(1, "Card is required"),
    reason: z.string().max(500).optional(),
    notifyViaTicket: z.string().optional(),
});

export async function adminFreezeCard(formData: FormData) {
    const { authorized, session } = await checkAdminAction();
    if (!authorized || !session || !session.user) return { success: false, message: "Unauthorized" };
    if (!canPerform(session.user.role as UserRole, 'MONEY')) return { success: false, message: "Insufficient permissions." };

    const rawData = {
        cardId: formData.get("cardId") as string,
        reason: formData.get("reason") as string || undefined,
        notifyViaTicket: formData.get("notifyViaTicket") as string || undefined,
    };
    const parsed = cardFreezeSchema.safeParse(rawData);
    if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };

    const { cardId, notifyViaTicket } = parsed.data;
    const safeReason = parsed.data.reason ? sanitize(parsed.data.reason) : undefined;
    let targetUserId = "";

    try {
        const card = await db.card.findUnique({ where: { id: cardId }, include: { user: true } });
        if (!card) return { success: false, message: "Card not found." };
        if (card.user.role === UserRole.SUPER_ADMIN) return { success: false, message: "Cannot freeze Super Admin card." };

        targetUserId = card.userId;
        const lastFour = card.cardNumber.slice(-4);

        await db.card.update({
            where: { id: cardId },
            data: {
                status: CardStatus.BLOCKED,
                adminLocked: true,
                adminLockReason: safeReason || null,
            }
        });

        await db.notification.create({
            data: {
                userId: card.userId,
                title: "Card Frozen",
                message: safeReason
                    ? `Your card ending in ${lastFour} has been frozen by an administrator: ${safeReason}`
                    : `Your card ending in ${lastFour} has been frozen by an administrator.`,
                type: "WARNING",
                link: "/dashboard/support",
                isRead: false
            }
        });

        if (notifyViaTicket === 'on') {
            await createSupportTicket(
                card.userId,
                "Card Frozen",
                safeReason || `Your card ending in ${lastFour} has been frozen. Please reply here if you have any questions.`,
                session.user.email || "Admin"
            );
        }

        await logAdminAction(
            "CARD_FREEZE",
            cardId,
            { userId: card.userId, reason: safeReason, admin: session.user.email },
            "WARNING",
            "SUCCESS"
        );

        await logSecurityEvent({
            action: "ADMIN_CARD_FREEZE",
            level: "WARNING",
            details: { targetUserId: card.userId, cardId, reason: safeReason, adminEmail: session.user.email },
            adminId: session.user.id,
            userId: card.userId,
        });

    } catch (err) {
        console.error("Card Freeze Error:", err);
        return { success: false, message: "Failed to freeze card." };
    }

    revalidatePath(`/admin/users/${targetUserId}`);
    revalidatePath("/admin/users");
    return { success: true, message: "Card frozen." };
}

export async function adminUnfreezeCard(cardId: string) {
    const { authorized, session } = await checkAdminAction();
    if (!authorized || !session || !session.user) return { success: false, message: "Unauthorized" };
    if (!canPerform(session.user.role as UserRole, 'MONEY')) return { success: false, message: "Insufficient permissions." };

    let targetUserId = "";

    try {
        const card = await db.card.findUnique({ where: { id: cardId } });
        if (!card) return { success: false, message: "Card not found." };

        targetUserId = card.userId;
        const lastFour = card.cardNumber.slice(-4);

        await db.card.update({
            where: { id: cardId },
            data: {
                status: CardStatus.ACTIVE,
                adminLocked: false,
                adminLockReason: null,
            }
        });

        await db.notification.create({
            data: {
                userId: card.userId,
                title: "Card Unfrozen",
                message: `Your card ending in ${lastFour} has been unfrozen and is active again.`,
                type: "SUCCESS",
                link: "/dashboard/cards",
                isRead: false
            }
        });

        await logAdminAction(
            "CARD_UNFREEZE",
            cardId,
            { userId: card.userId, admin: session.user.email },
            "INFO",
            "SUCCESS"
        );

        await logSecurityEvent({
            action: "ADMIN_CARD_UNFREEZE",
            level: "INFO",
            details: { targetUserId: card.userId, cardId, adminEmail: session.user.email },
            adminId: session.user.id,
            userId: card.userId,
        });

    } catch (err) {
        console.error("Card Unfreeze Error:", err);
        return { success: false, message: "Failed to unfreeze card." };
    }

    revalidatePath(`/admin/users/${targetUserId}`);
    revalidatePath("/admin/users");
    return { success: true, message: "Card unfrozen." };
}
