import { db } from "@/lib/db";
import Link from "next/link";
import TransactionTable from "@/components/admin/users/[id]/transactions/TransactionTable";
import { ChevronLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin-auth";
import { notFound } from "next/navigation";
import styles from "../../../../../components/admin/users/[id]/transactions/transactions.module.css"

export default async function AdminUserTransactionsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    await requireAdmin();

    const user = await db.user.findUnique({
        where: { id },
        select: { fullName: true, email: true, currency: true }
    });

    if (!user) return notFound();

    const currency = user.currency || "USD";
    let exchangeRate = 1;
    if (currency !== "USD") {
        const rateData = await db.exchangeRate.findUnique({ where: { currency } });
        if (rateData) exchangeRate = Number(rateData.rate);
    }

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
                        <ChevronLeft size={16} /> Back to User Profile
                    </Link>
                    <div className={styles.title}>
                        History: <span className={styles.fullName}>{user.fullName}</span>
                    </div>
                    <div className={styles.currencyContainer}>
                        <p className={styles.subtitle}>{user.email}</p>
                        {currency !== "USD" && (
                            <span className={styles.currencyBadge}>{currency} (Rate: {exchangeRate})</span>
                        )}
                    </div>
                </div>
            </div>

            <TransactionTable
                transactions={transactions}
                currency={currency}
                rate={exchangeRate}
            />
        </div>
    );
}
