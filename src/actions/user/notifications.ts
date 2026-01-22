'use server';

import { getAuthenticatedUser } from "@/lib/user-guard";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// 1. GET NOTIFICATIONS
export async function getNotifications() {
  const { success, message, user } = await getAuthenticatedUser();

     if (!success || !user) {
          return { success: false, message };
      }

  try {
    const notifications = await db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    return notifications;
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
}

// 2. MARK AS READ
export async function markNotificationRead(notificationId: string) {
   const { success, message, user } = await getAuthenticatedUser();

     if (!success || !user) {
          return { success: false, message };
      }

  try {
    await db.notification.update({
      where: { id: notificationId, userId: user.id },
      data: { isRead: true }
    });
  } catch (error) {
    console.error("Failed to mark read:", error);
    return { success: false, message: "Database error" };
  }

  // ✅ Fix: Revalidate outside try/catch
  revalidatePath("/dashboard");
  return { success: true };
}

// 3. MARK ALL READ
export async function markAllNotificationsRead() {
    const { success, message, user } = await getAuthenticatedUser();

     if (!success || !user) {
          return { success: false, message };
      }

    try {
      await db.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true }
      });
    } catch (error) {
      console.error("Failed to mark all read:", error);
      return { success: false, message: "Database error" };
    }

    // ✅ Fix: Revalidate outside try/catch
    revalidatePath("/dashboard");
    return { success: true };
}