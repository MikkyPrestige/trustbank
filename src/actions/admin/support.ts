'use server';

import { db } from "@/lib/db";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { logAdminAction } from "@/lib/utils/admin-logger";
import { revalidatePath } from "next/cache";
import { canPerform } from "@/lib/auth/permissions";
import { UserRole } from "@prisma/client";

export async function adminReplyTicket(ticketId: string, message: string) {
  const { authorized, session } = await checkAdminAction();

  if (!authorized || !session || !session.user) {
      return { success: false, message: "Unauthorized" };
  }

  if (!canPerform(session.user.role as UserRole, 'EDIT')) {
      return { success: false, message: "Insufficient permissions." };
  }

  if(!message.trim()) return { success: false, message: "Message required" };

  try {
    const ticketInfo = await db.$transaction(async (tx) => {
        await tx.ticketMessage.create({
            data: {
                ticketId,
                sender: "ADMIN",
                message
            }
        });

        return await tx.ticket.findUnique({
            where: { id: ticketId },
            select: { userId: true, subject: true }
        });
    });

    if (ticketInfo) {
        await db.notification.create({
            data: {
                userId: ticketInfo.userId,
                title: "Support Reply",
                message: `Admin replied to: ${ticketInfo.subject}`,
                type: "INFO",
                link: `/dashboard/support/${ticketId}`,
                isRead: false
            }
        });
    }

    await logAdminAction(
        "TICKET_REPLY",
        ticketId,
        { admin: session.user.email },
        "INFO",
        "SUCCESS"
    );

  } catch (error) {
    console.error("Support Reply Error:", error);
    return { success: false, message: "Failed to send reply." };
  }

  revalidatePath(`/admin/support/${ticketId}`);
  revalidatePath("/admin/support");

  return { success: true, message: "Reply sent." };
}

export async function closeTicket(ticketId: string) {
    const { authorized, session } = await checkAdminAction();

    if (!authorized || !session || !session.user) {
        return { success: false, message: "Unauthorized" };
    }

    if (!canPerform(session.user.role as UserRole, 'EDIT')) {
        return { success: false, message: "Insufficient permissions." };
    }

    try {
        const closedTicket = await db.$transaction(async (tx) => {
            return await tx.ticket.update({
                where: { id: ticketId },
                data: { status: "CLOSED" },
                select: { userId: true, subject: true }
            });
        });

        if (closedTicket) {
            await db.notification.create({
                data: {
                    userId: closedTicket.userId,
                    title: "Ticket Closed",
                    message: `Your ticket "${closedTicket.subject}" has been marked as resolved.`,
                    type: "SUCCESS",
                    link: `/dashboard/support/${ticketId}`,
                    isRead: false
                }
            });
        }

        await logAdminAction(
            "CLOSE_TICKET",
            ticketId,
            { admin: session.user.email },
            "INFO",
            "SUCCESS"
        );

    } catch (error) {
        console.error("Close Ticket Error:", error);
        return { success: false, message: "Error closing ticket." };
    }

    revalidatePath(`/admin/support/${ticketId}`);
    revalidatePath("/admin/support");

    return { success: true, message: "Ticket closed." };
}