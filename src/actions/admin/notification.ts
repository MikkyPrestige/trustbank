'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// 1. Fetch Notifications
export async function getNotifications() {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        const notifications = await db.notification.findMany({
            where: {
                userId: session.user.id,
                isRead: false
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        return notifications;
    } catch (error) {
        return [];
    }
}

// 2. Mark Single as Read
export async function markAsRead(notificationId: string) {
    const session = await auth();
    if (!session) return;

    await db.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard");
}

// 3. Mark ALL as Read
export async function markAllAsRead() {
    const session = await auth();
    if (!session?.user?.id) return;

    await db.notification.updateMany({
        where: { userId: session.user.id, isRead: false },
        data: { isRead: true }
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard");
}