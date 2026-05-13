'use server';

import { db } from "@/lib/db";
import { checkAdminAction } from "@/lib/auth/admin-auth";

export async function getSecurityLogs(page = 1, pageSize = 50) {
  const { authorized } = await checkAdminAction();
  if (!authorized) return { logs: [], total: 0, page, pageSize };

  const skip = (page - 1) * pageSize;

  const [logs, total] = await Promise.all([
    db.securityLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    db.securityLog.count(),
  ]);

  return { logs, total, page, pageSize };
}