import { db } from "@/lib/db";
import PressClientManager from "@/components/admin/press/PressClientManager";

export const dynamic = 'force-dynamic';

export default async function AdminPressPage() {
    const releases = await db.pressRelease.findMany({
        orderBy: { date: 'desc' }
    });

    return <PressClientManager initialReleases={releases} />;
}