import { db } from "@/lib/db";
import ReportClientManager from "@/components/admin/investors/ReportClientManager";

export const dynamic = 'force-dynamic';

export default async function AdminInvestorsPage() {
    const reports = await db.financialReport.findMany({
        orderBy: { date: 'desc' }
    });

    return (
        <ReportClientManager initialReports={reports} />
    );
}