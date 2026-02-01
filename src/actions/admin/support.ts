'use server';

import { db } from "@/lib/db";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { logAdminAction } from "@/lib/utils/admin-logger";
import { revalidatePath } from "next/cache";
import { canPerform } from "@/lib/auth/permissions";
import { UserRole } from "@prisma/client";

// 1. ADMIN REPLY
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
    // Return the ticket data directly from the transaction
    const ticketInfo = await db.$transaction(async (tx) => {
        // A. Add Message
        await tx.ticketMessage.create({
            data: {
                ticketId,
                sender: "ADMIN",
                message
            }
        });

        // B. Fetch ticket details and RETURN them
        return await tx.ticket.findUnique({
            where: { id: ticketId },
            select: { userId: true, subject: true }
        });
    });

    // C. Send Notification
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

// 2. CLOSE TICKET
export async function closeTicket(ticketId: string) {
    const { authorized, session } = await checkAdminAction();

    if (!authorized || !session || !session.user) {
        return { success: false, message: "Unauthorized" };
    }

    if (!canPerform(session.user.role as UserRole, 'EDIT')) {
        return { success: false, message: "Insufficient permissions." };
    }

    try {
        // Return the updated ticket directly from the transaction
        const closedTicket = await db.$transaction(async (tx) => {
            // A. Update Ticket Status & Return the result
            return await tx.ticket.update({
                where: { id: ticketId },
                data: { status: "CLOSED" },
                select: { userId: true, subject: true }
            });
        });

        // B. Notify User
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

// 'use server';

// import { db } from "@/lib/db";
// import { checkAdminAction } from "@/lib/auth/admin-auth";
// import { logAdminAction } from "@/lib/utils/admin-logger";
// import { revalidatePath } from "next/cache";
// import { canPerform } from "@/lib/auth/permissions";
// import { UserRole } from "@prisma/client";

// // 1. ADMIN REPLY
// export async function adminReplyTicket(ticketId: string, message: string) {
//   const { authorized, session } = await checkAdminAction();

//   if (!authorized || !session || !session.user) {
//       return { success: false, message: "Unauthorized" };
//   }

//   if (!canPerform(session.user.role as UserRole, 'EDIT')) {
//       return { success: false, message: "Insufficient permissions." };
//   }

//   if(!message.trim()) return { success: false, message: "Message required" };

//   try {
//     // ✅ FIX: Return the ticket data directly from the transaction
//     const ticketInfo = await db.$transaction(async (tx) => {
//         // A. Add Message
//         await tx.ticketMessage.create({
//             data: {
//                 ticketId,
//                 sender: "ADMIN",
//                 message
//             }
//         });

//         // B. Fetch ticket details and RETURN them
//         return await tx.ticket.findUnique({
//             where: { id: ticketId },
//             select: { userId: true, subject: true }
//         });
//     });

//     // C. Send Notification (OUTSIDE Transaction)
//     // TypeScript now knows ticketInfo is { userId, subject } | null
//     if (ticketInfo) {
//         await db.notification.create({
//             data: {
//                 userId: ticketInfo.userId,
//                 title: "Support Reply",
//                 message: `Admin replied to: ${ticketInfo.subject}`,
//                 type: "INFO",
//                 link: `/dashboard/support/${ticketId}`,
//                 isRead: false
//             }
//         });
//     }

//     await logAdminAction("TICKET_REPLY", ticketId, { admin: session.user.email });

//   } catch (error) {
//     console.error("Support Reply Error:", error);
//     return { success: false, message: "Failed to send reply." };
//   }

//   revalidatePath(`/admin/support/${ticketId}`);
//   revalidatePath("/admin/support");

//   return { success: true, message: "Reply sent." };
// }

// // 2. CLOSE TICKET
// export async function closeTicket(ticketId: string) {
//     const { authorized, session } = await checkAdminAction();

//     if (!authorized || !session || !session.user) {
//         return { success: false, message: "Unauthorized" };
//     }

//     if (!canPerform(session.user.role as UserRole, 'EDIT')) {
//         return { success: false, message: "Insufficient permissions." };
//     }

//     try {
//         // ✅ FIX: Return the updated ticket directly from the transaction
//         const closedTicket = await db.$transaction(async (tx) => {
//             // A. Update Ticket Status & Return the result
//             return await tx.ticket.update({
//                 where: { id: ticketId },
//                 data: { status: "CLOSED" },
//                 select: { userId: true, subject: true }
//             });
//         });

//         // B. Notify User (OUTSIDE Transaction)
//         // TypeScript guarantees closedTicket exists here because update throws if not found
//         if (closedTicket) {
//             await db.notification.create({
//                 data: {
//                     userId: closedTicket.userId,
//                     title: "Ticket Closed",
//                     message: `Your ticket "${closedTicket.subject}" has been marked as resolved.`,
//                     type: "SUCCESS",
//                     link: `/dashboard/support/${ticketId}`,
//                     isRead: false
//                 }
//             });
//         }

//         await logAdminAction("CLOSE_TICKET", ticketId, { admin: session.user.email });

//     } catch (error) {
//         console.error("Close Ticket Error:", error);
//         return { success: false, message: "Error closing ticket." };
//     }

//     revalidatePath(`/admin/support/${ticketId}`);
//     revalidatePath("/admin/support");

//     return { success: true, message: "Ticket closed." };
// }