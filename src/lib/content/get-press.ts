import { db } from "@/lib/db";

export async function getPressReleases() {
    try {
        const releases = await db.pressRelease.findMany({
            orderBy: { date: 'desc' },
        });
        return releases;
    } catch (error) {
        console.error("Failed to fetch press releases:", error);
        return [];
    }
}