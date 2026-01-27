import { db } from "@/lib/db";
import Link from "next/link";
import VerificationRow from "@/components/admin/verifications/VerificationRow";
import { requireAdmin } from "@/lib/auth/admin-auth";
import { ArrowLeft, PartyPopper } from "lucide-react";
import styles from "../../../components/admin/verifications/verifications.module.css"

export default async function VerificationsPage() {
    await requireAdmin();

    const pendingUsers = await db.user.findMany({
        where: { kycStatus: 'PENDING' },
        orderBy: { updatedAt: 'desc' }
    });

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>KYC Applications</h1>
                    <p className={styles.subtitle}>Review identity documents and approve pending requests ({pendingUsers.length})</p>
                </div>

                <div className={styles.headerActions}>
                    <Link href="/admin" className={styles.backBtn}>
                        <ArrowLeft size={16} /> Dashboard
                    </Link>
                </div>
            </header>

            <div className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>User Details</th>
                            <th>Submitted Date</th>
                            <th>Current Status</th>
                            <th>Documents</th>
                            <th>Decision</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>
                                        <PartyPopper size={48} strokeWidth={1} />
                                    </div>
                                    <p>All caught up! No pending KYC applications.</p>
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