import { db } from "@/lib/db";
import JobClientManager from "@/components/admin/jobs/JobClientManager";

export default async function AdminJobsPage() {
    // Fetch latest first
    const jobs = await db.jobListing.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return <JobClientManager initialJobs={jobs} />;
}