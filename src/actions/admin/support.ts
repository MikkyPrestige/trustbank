'use server';

import { db } from "@/lib/db";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { logAdminAction } from "@/lib/utils/admin-logger";
import { revalidatePath } from "next/cache";
import { canPerform } from "@/lib/auth/permissions";
import { UserRole } from "@prisma/client";
import { z } from "zod";

const sanitize = (str: string) => str.replace(/<[^>]*>/g, '');

const newTicketSchema = z.object({
  userId: z.string().min(1, "User is required"),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(100),
  message: z.string().min(10, "Please write at least 10 characters").max(2000),
});

// Shared by adminCreateTicket and any other admin action that wants to open a
// ticket on a user's behalf (e.g. notifying them of a service restriction).
export async function createSupportTicket(userId: string, subject: string, message: string, adminEmail: string) {
    const safeSubject = sanitize(subject);
    const safeMessage = sanitize(message);

    const ticket = await db.ticket.create({
        data: {
            userId,
            subject: safeSubject,
            status: "OPEN",
            messages: {
                create: {
                    sender: "ADMIN",
                    message: safeMessage
                }
            }
        }
    });

    await db.notification.create({
        data: {
            userId,
            title: "New Message from Support",
            message: safeSubject,
            type: "INFO",
            link: `/dashboard/support/${ticket.id}`,
            isRead: false
        }
    });

    await logAdminAction(
        "CREATE_TICKET",
        ticket.id,
        { userId, subject: safeSubject, admin: adminEmail },
        "INFO",
        "SUCCESS"
    );

    return ticket;
}

export async function adminCreateTicket(formData: FormData) {
  const { authorized, session } = await checkAdminAction();

  if (!authorized || !session || !session.user) {
      return { success: false, message: "Unauthorized" };
  }

  if (!canPerform(session.user.role as UserRole, 'EDIT')) {
      return { success: false, message: "Insufficient permissions." };
  }

  const rawData = {
    userId: formData.get("userId") as string,
    subject: formData.get("subject") as string,
    message: formData.get("message") as string,
  };
  const parsed = newTicketSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }
  const { userId, subject, message } = parsed.data;

  try {
    const targetUser = await db.user.findUnique({ where: { id: userId } });
    if (!targetUser) return { success: false, message: "User not found." };

    const ticket = await createSupportTicket(userId, subject, message, session.user.email || "Admin");

    revalidatePath("/admin/support");
    revalidatePath(`/admin/users/${userId}`);

    return { success: true, message: "Message sent.", ticketId: ticket.id };

  } catch (error) {
    console.error("Admin Create Ticket Error:", error);
    return { success: false, message: "Failed to create ticket." };
  }
}

export async function adminReplyTicket(ticketId: string, message: string) {
  const { authorized, session } = await checkAdminAction();

  if (!authorized || !session || !session.user) {
      return { success: false, message: "Unauthorized" };
  }

  if (!canPerform(session.user.role as UserRole, 'EDIT')) {
      return { success: false, message: "Insufficient permissions." };
  }

  const messageSchema = z.string().min(1, "Message required").max(2000);
const parsed = messageSchema.safeParse(message);
if (!parsed.success) {
  return { success: false, message: parsed.error.issues[0].message };
}
const cleanMessage = sanitize(parsed.data);

  try {
    const ticketInfo = await db.$transaction(async (tx) => {
        await tx.ticketMessage.create({
            data: {
                ticketId,
                sender: "ADMIN",
                message: cleanMessage
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