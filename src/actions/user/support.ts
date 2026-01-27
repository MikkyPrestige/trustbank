'use server';

import { getAuthenticatedUser } from "@/lib/auth/user-guard";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { UserRole } from "@prisma/client";

const ticketSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Please describe your issue in detail (min 10 chars)."),
  priority: z.enum(["LOW", "NORMAL", "HIGH"]).optional(),
});

// Reply to an existing ticket
const replySchema = z.object({
    ticketId: z.string().min(1),
    message: z.string().min(1, "Message cannot be empty"),
});

// 1. CREATE TICKET
export async function createTicket(prevState: any, formData: FormData) {
 const { success, message, user } = await getAuthenticatedUser();

   if (!success || !user) {
        return { message };
    }

  const rawData = Object.fromEntries(formData.entries());
  const validated = ticketSchema.safeParse(rawData);

  if (!validated.success) {
    return { message: validated.error.issues[0].message };
  }

  const { subject, priority, message: ticketMessage } = validated.data;

  try {
    // 1. CREATE TICKET (Atomic DB Write)
    // Prisma handles nested creates (ticket + message) as a single atomic transaction automatically.
    const ticket = await db.ticket.create({
        data: {
          userId: user.id,
          subject,
          priority,
          status: "OPEN",
          messages: {
            create: {
              sender: "USER",
              message: ticketMessage
            }
          }
        }
    });

    // 2. NOTIFY ADMINS (Side Effect - Moved Outside)
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
                    message: `New Ticket: "${subject}" from ${user.fullName || 'User'}`,
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

// 2. REPLY TO TICKET (User Side)
export async function replyToTicket(prevState: any, formData: FormData) {
   const { success, message, user } = await getAuthenticatedUser();

    if (!success || !user) {
        return { message };
    }

    const rawData = Object.fromEntries(formData.entries());
    const validated = replySchema.safeParse(rawData);

    if (!validated.success) return { message: "Invalid input" };

    const { ticketId, message: replyMessage } = validated.data;

    try {
        // 1. Verify ownership
        const ticket = await db.ticket.findUnique({
            where: { id: ticketId, userId: user.id }
        });

        if (!ticket) return { message: "Ticket not found" };

        // 2. DB UPDATE (Transaction)
        await db.$transaction(async (tx) => {
            // Add User Message
            await tx.ticketMessage.create({
                data: {
                    ticketId,
                    sender: "USER",
                    message: replyMessage
                }
            });

            // Update Ticket Timestamp & Status
            await tx.ticket.update({
                where: { id: ticketId },
                data: { updatedAt: new Date(), status: "OPEN" } // Re-open if closed
            });
        });

        // 3. NOTIFY ADMINS (Side Effect - Moved Outside)
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
                        message: `User ${user.fullName || 'Customer'} replied to ticket #${ticketId.slice(-4)}`,
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


// 'use server';

// import { auth } from "@/auth";
// import { db } from "@/lib/db";
// import { revalidatePath } from "next/cache";
// import { z } from "zod";

// const ticketSchema = z.object({
//   subject: z.string().min(3, "Subject must be at least 3 characters"),
//   message: z.string().min(10, "Please describe your issue in detail (min 10 chars)."),
//   priority: z.enum(["LOW", "NORMAL", "HIGH"]).optional(),
// });

// // Reply to an existing ticket
// const replySchema = z.object({
//     ticketId: z.string().min(1),
//     message: z.string().min(1, "Message cannot be empty"),
// });

// // 1. CREATE TICKET
// export async function createTicket(prevState: any, formData: FormData) {
//   const session = await auth();
//   if (!session) return { message: "Unauthorized" };

//   const rawData = Object.fromEntries(formData.entries());
//   const validated = ticketSchema.safeParse(rawData);

//   if (!validated.success) {
//     return { message: validated.error.issues[0].message };
//   }

//   const { subject, priority, message } = validated.data;

//   try {
//     // 👇 CHANGED: Wrapped in transaction to handle Notification safely
//     await db.$transaction(async (tx) => {

//       // 1. Create Ticket & Capture it in a variable (to get the ID)
//       const ticket = await tx.ticket.create({
//         data: {
//           userId: session.user.id,
//           subject,
//           priority,
//           status: "OPEN",
//           messages: {
//             create: {
//               sender: "USER",
//               message: message
//             }
//           }
//         }
//       });

//       // 👇 NEW: NOTIFY ADMINS & SUPER ADMINS
//       const admins = await tx.user.findMany({
//         where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
//         select: { id: true }
//       });

//       if (admins.length > 0) {
//         await tx.notification.createMany({
//           data: admins.map((admin) => ({
//             userId: admin.id,
//             title: "New Support Ticket",
//             message: `New Ticket: "${subject}" from ${session.user.name || 'User'}`,
//             type: "INFO",
//             link: `/admin/support/${ticket.id}`,
//             isRead: false
//           }))
//         });
//       }
//       // 👆 END NEW CODE

//     });

//   } catch (error) {
//     console.error("Create Ticket Error:", error); // Added console log for easier debugging
//     return { message: "Failed to submit ticket." };
//   }

//   revalidatePath("/dashboard/support");
//   return { success: true, message: "Ticket created successfully!" };
// }

// // 2. REPLY TO TICKET (User Side)
// export async function replyToTicket(prevState: any, formData: FormData) {
//     const session = await auth();
//     if (!session?.user?.id) return { message: "Unauthorized" };

//     const rawData = Object.fromEntries(formData.entries());
//     const validated = replySchema.safeParse(rawData);

//     if (!validated.success) return { message: "Invalid input" };

//     const { ticketId, message } = validated.data;

//     try {
//         // 1. Verify ownership
//         const ticket = await db.ticket.findUnique({
//             where: { id: ticketId, userId: session.user.id }
//         });

//         if (!ticket) return { message: "Ticket not found" };

//         await db.$transaction(async (tx) => {
//             // 2. Add User Message
//             await tx.ticketMessage.create({
//                 data: {
//                     ticketId,
//                     sender: "USER",
//                     message
//                 }
//             });

//             // 3. Update Ticket Timestamp & Status
//             await tx.ticket.update({
//                 where: { id: ticketId },
//                 data: { updatedAt: new Date(), status: "OPEN" } // Re-open if closed
//             });

//           // ✅ 4. NOTIFY ADMINS & SUPER ADMINS
// const admins = await tx.user.findMany({
//     where: {
//         role: { in: ["ADMIN", "SUPER_ADMIN"] }
//     },
//     select: { id: true }
// });

//             // Create a notification for each admin
//             if (admins.length > 0) {
//                 await tx.notification.createMany({
//                     data: admins.map(admin => ({
//                         userId: admin.id,
//                         title: "New Support Reply",
//                         message: `User ${session.user?.name || 'Customer'} replied to ticket #${ticketId.slice(-4)}`,
//                         type: "INFO",
//                         link: `/admin/support/${ticketId}`,
//                         isRead: false
//                     }))
//                 });
//             }
//         });

//     } catch (error) {
//         console.error("Reply Error:", error);
//         return { message: "Failed to send reply" };
//     }

//     revalidatePath(`/dashboard/support/${ticketId}`);
//     return { success: true, message: "Reply sent" };
// }