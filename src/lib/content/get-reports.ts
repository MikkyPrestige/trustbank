import { db } from "@/lib/db";

export async function getFinancialReports() {
    try {
        const reports = await db.financialReport.findMany({
            orderBy: { date: 'desc' },
        });
        return reports;
    } catch (error) {
        console.error("Failed to fetch financial reports:", error);
        return [];
    }
}