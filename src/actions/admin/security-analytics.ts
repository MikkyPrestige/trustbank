'use server';

import { db } from "@/lib/db";
import { checkAdminAction } from "@/lib/auth/admin-auth";

export async function getSecurityStats() {
    const { authorized } = await checkAdminAction();
    if (!authorized) return null;

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    try {
        // 1. Run Aggregations in Parallel for speed
        const [
            totalLogs,
            criticalEvents,
            warnings,
            recentLogs
        ] = await Promise.all([
            db.adminLog.count(),

            // Critical Threats (Last 24h)
            db.adminLog.count({
                where: {
                    level: 'CRITICAL',
                    createdAt: { gte: twentyFourHoursAgo }
                }
            }),

            // Warnings (Last 24h)
            db.adminLog.count({
                where: {
                    level: 'WARNING',
                    createdAt: { gte: twentyFourHoursAgo }
                }
            }),

            // Latest 5 Events (for the feed)
            db.adminLog.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { admin: { select: { fullName: true, email: true } } }
            })
        ]);

        return {
            totalLogs,
            criticalEvents,
            warnings,
            recentLogs
        };
    } catch (error) {
        console.error("Failed to fetch security stats", error);
        return null;
    }
}