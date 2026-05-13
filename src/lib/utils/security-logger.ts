import { db } from "@/lib/db";

type SecurityLevel = "INFO" | "WARNING" | "CRITICAL";

interface SecurityLogEntry {
  action: string;
  level?: SecurityLevel;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  userId?: string;
  adminId?: string;
}

export async function logSecurityEvent({
  action,
  level = "INFO",
  details,
  ipAddress,
  userAgent,
  userId,
  adminId,
}: SecurityLogEntry) {
  try {
    await db.securityLog.create({
      data: {
        action,
        level,
        details: details ?? undefined,
        ipAddress,
        userAgent,
        userId,
        adminId,
      },
    });
  } catch (error) {
    console.error("Failed to write security log:", error);
  }
}