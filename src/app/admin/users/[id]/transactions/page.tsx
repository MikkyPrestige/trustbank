import { db } from "@/lib/db";
import Link from "next/link";
import TransactionTable from "@/components/admin/users/[id]/transactions/TransactionTable";
import { ChevronLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { notFound } from "next/navigation";
import styles from "../../../../../components/admin/users/[id]/transactions/transactions.module.css"

export default async function AdminUserTransactionsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    await requireAdmin();

    const user = await db.user.findUnique({
        where: { id },
        select: { fullName: true, email: true }
    });

    if (!user) return notFound();

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
                        <ChevronLeft size={14} /> Back to User Profile
                    </Link>
                    <h1 className={styles.title}>History: {user.fullName}</h1>
                    <p className={styles.subtitle}>{user.email}</p>
                </div>
            </div>

            <TransactionTable transactions={transactions} />
        </div>
    );
}