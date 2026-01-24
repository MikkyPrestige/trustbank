import { db } from "@/lib/db";
import BranchClientManager from "@/components/admin/branches/BranchClientManager";

export default async function AdminBranchesPage() {
    const branches = await db.branch.findMany({
        orderBy: { createdAt: 'asc' }
    });

    return <BranchClientManager initialBranches={branches} />;
}