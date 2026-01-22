import { db } from "@/lib/db";
import Link from "next/link";
import TransactionTable from "./TransactionTable";
import styles from "./transactions.module.css";
import { ChevronLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminUserTransactionsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    await requireAdmin();

    const user = await db.user.findUnique({
        where: { id: id },
        select: { fullName: true, email: true }
    });

    if (!user) return <div style={{ color: '#fff', padding: '2rem' }}>User not found</div>;

    // Fetch ALL transactions for this user (across all accounts)
    const transactions = await db.ledgerEntry.findMany({
        where: {
            account: { userId: id }
        },
        include: {
            account: true
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <Link href={`/admin/users/${id}`} className={styles.backLink}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <ChevronLeft size={14} /> Back to User Profile
                        </span>
                    </Link>
                    <h1 className={styles.title}>History: {user.fullName}</h1>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>{user.email}</p>
                </div>
            </div>

            <TransactionTable transactions={transactions} />
        </div>
    );
}