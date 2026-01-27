import { auth } from "@/auth";
import { db } from "@/lib/db";
import { UserStatus } from "@prisma/client";

type UserGuardResult =
  | { success: false; message: string; user: null }
  | { success: true; message: null; user: NonNullable<Awaited<ReturnType<typeof db.user.findUnique>>> };

export async function getAuthenticatedUser(): Promise<UserGuardResult> {
  const session = await auth();

  // 1. Check Session
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized", user: null };
  }

  // 2. Check Database Record
  const user = await db.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) {
    return { success: false, message: "Session invalid. Please log out and log back in.", user: null };
  }

  // 3. Check Status (Global protection)
  if (user.status === UserStatus.FROZEN) {
    return { success: false, message: "Account is Frozen. Contact Support.", user: null };
  }

  if (user.status === UserStatus.SUSPENDED) {
    return { success: false, message: "Account is Suspended. Contact Support.", user: null };
  }

  return { success: true, message: null, user };
}