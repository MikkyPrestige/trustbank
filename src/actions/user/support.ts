'use server';

import { getAuthenticatedUser } from "@/lib/auth/user-guard";
import { db } from "@/lib/db";
import { checkMaintenanceMode } from "@/lib/security";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { UserRole } from "@prisma/client";

const sanitize = (str: string) => str.replace(/<[^>]*>/g, '');

const ticketSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters").max(100),
  message: z.string().min(10, "Please describe your issue in detail (min 10 chars).").max(2000),
  priority: z.enum(["LOW", "NORMAL", "HIGH"]).optional(),
});

const replySchema = z.object({
    ticketId: z.string().min(1, "Ticket ID is required"),
    message: z.string().min(1, "Message cannot be empty").max(2000),
});


export async function createTicket(prevState: any, formData: FormData) {
 const { success, message, user } = await getAuthenticatedUser();

 if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }

   if (!success || !user) {
        return { message };
    }

  const rawData = Object.fromEntries(formData.entries());
  const validated = ticketSchema.safeParse(rawData);

  if (!validated.success) {
    return { message: validated.error.issues[0].message };
  }

  const { subject, priority, message: ticketMessage } = validated.data;

  // Sanitize to prevent stored XSS
const safeSubject = sanitize(subject);
const safeMessage = sanitize(ticketMessage);

  try {
    const ticket = await db.ticket.create({
        data: {
          userId: user.id,
          subject: safeSubject,
          priority,
          status: "OPEN",
          messages: {
            create: {
              sender: "USER",
              message: safeMessage
            }
          }
        }
    });

    try {
        const admins = await db.user.findMany({
            where: { role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] } },
            select: { id: true }
        });

        if (admins.length > 0) {
            await db.notification.createMany({
                data: admins.map((admin) => ({
                    userId: admin.id,
                    title: "New Support Ticket",
                    message: `New Ticket: "${safeSubject}" from ${sanitize(user.fullName || 'User')}`,
                    type: "INFO",
                    link: `/admin/support/${ticket.id}`,
                    isRead: false
                }))
            });
        }
    } catch (notifErr) {
        console.error("Ticket Notification Failed:", notifErr);
    }

  } catch (error) {
    console.error("Create Ticket Error:", error);
    return { message: "Failed to submit ticket." };
  }

  revalidatePath("/dashboard/support");
  return { success: true, message: "Ticket created successfully!" };
}

export async function replyToTicket(prevState: any, formData: FormData) {
   const { success, message, user } = await getAuthenticatedUser();

   if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }

    if (!success || !user) {
        return { message };
    }

    const rawData = Object.fromEntries(formData.entries());
    const validated = replySchema.safeParse(rawData);

    if (!validated.success) return { message: "Invalid input" };

    const { ticketId, message: replyMessage } = validated.data;

    try {
        const ticket = await db.ticket.findUnique({
            where: { id: ticketId, userId: user.id }
        });

        if (!ticket) return { message: "Ticket not found" };

        const safeReply = sanitize(replyMessage);

        await db.$transaction(async (tx) => {
            await tx.ticketMessage.create({
                data: {
                    ticketId,
                    sender: "USER",
                    message: safeReply
                }
            });

            await tx.ticket.update({
                where: { id: ticketId },
                data: { updatedAt: new Date(), status: "OPEN" }
            });
        });

        try {
            const admins = await db.user.findMany({
                where: { role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] } },
                select: { id: true }
            });

            if (admins.length > 0) {
                await db.notification.createMany({
                    data: admins.map(admin => ({
                        userId: admin.id,
                        title: "New Support Reply",
                        message: `User ${sanitize(user.fullName || 'Customer')} replied to ticket #${ticketId.slice(-4)}`,
                        type: "INFO",
                        link: `/admin/support/${ticketId}`,
                        isRead: false
                    }))
                });
            }
        } catch (notifErr) {
            console.error("Reply Notification Failed:", notifErr);
        }

    } catch (error) {
        console.error("Reply Error:", error);
        return { message: "Failed to send reply" };
    }

    revalidatePath(`/dashboard/support/${ticketId}`);
    return { success: true, message: "Reply sent" };
}