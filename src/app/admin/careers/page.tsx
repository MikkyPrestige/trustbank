import { db } from "@/lib/db";
import JobClientManager from "@/components/admin/careers/JobClientManager";

export default async function AdminJobsPage() {
    const jobs = await db.jobListing.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return <JobClientManager initialJobs={jobs} />;
}