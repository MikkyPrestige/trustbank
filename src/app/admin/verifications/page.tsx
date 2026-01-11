import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import VerificationRow from "./VerificationRow";
import styles from "./verifications.module.css";

export default async function VerificationsPage() {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') redirect("/dashboard");

    // Fetch only users waiting for KYC
    const pendingUsers = await db.user.findMany({
        where: { status: 'PENDING_VERIFICATION' },
        orderBy: { updatedAt: 'desc' }
    });

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>KYC Applications</h1>
                    <p className={styles.subtitle}>Review identity documents ({pendingUsers.length} pending)</p>
                </div>
                <Link href="/admin" className={styles.backLink}>← Back to Admin</Link>
            </header>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Submitted</th>
                            <th>Status</th>
                            <th>Documents</th>
                            <th>Decision</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className={styles.empty}>
                                    All caught up! No pending applications.
                                </td>
                            </tr>
                        ) : (
                            pendingUsers.map(user => (
                                <VerificationRow key={user.id} user={user} />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}