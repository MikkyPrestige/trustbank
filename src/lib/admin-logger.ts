import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function logAdminAction(action: string, targetId?: string, details?: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) return;

    await db.adminLog.create({
      data: {
        adminId: session.user.id,
        action: action,
        targetId: targetId,
        metadata: details ? JSON.stringify(details) : null,
      },
    });
  } catch (err) {
    console.error("Failed to write admin log:", err);
    // We don't throw error here to avoid breaking the main app flow
  }
}