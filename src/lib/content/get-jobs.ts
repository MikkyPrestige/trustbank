import { db } from "@/lib/db";

export async function getJobs() {
  try {
    const jobs = await db.jobListing.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return jobs;
  } catch (error) {
    console.error("Database Error:", error);
    return [];
  }
}