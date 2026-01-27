'use server';

import { db } from "@/lib/db";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { TransactionType, TransactionStatus } from "@prisma/client";

export async function getBankRevenue() {
    const { authorized } = await checkAdminAction();
    if (!authorized) return { totalRevenue: 0, todayRevenue: 0 };

    try {
        // 1. Get TOTAL Revenue (Using the Enum)
        const totalAgg = await db.ledgerEntry.aggregate({
            _sum: { amount: true },
            where: {
                type: TransactionType.FEE,
                status: TransactionStatus.COMPLETED
            }
        });

        // 2. Get TODAY'S Revenue
        const startOfDay = new Date();
        startOfDay.setHours(0,0,0,0);

        const todayAgg = await db.ledgerEntry.aggregate({
            _sum: { amount: true },
            where: {
                type: TransactionType.FEE,
                status: TransactionStatus.COMPLETED,
                createdAt: { gte: startOfDay }
            }
        });

        return {
            totalRevenue: Number(totalAgg._sum.amount || 0),
            todayRevenue: Number(todayAgg._sum.amount || 0)
        };

    } catch (err) {
        console.error("Revenue Stats Error:", err);
        return { totalRevenue: 0, todayRevenue: 0 };
    }
}