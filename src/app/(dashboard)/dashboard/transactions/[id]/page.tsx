import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/content/get-settings"; // 👈 Import Settings
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Clock, AlertTriangle, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import styles from "../../../../../components/dashboard/transactions/[id]/receipt.module.css";
import ReceiptActions from "@/components/dashboard/transactions/[id]/ReceiptActions";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function TransactionDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    // 1. Fetch Transaction AND Settings in Parallel
    const [transaction, settings] = await Promise.all([
        db.ledgerEntry.findUnique({
            where: { id: id },
            include: { account: true },
        }),
        getSiteSettings()
    ]);

    if (!transaction) return notFound();

    if (transaction.account.userId !== session.user.id) {
        return notFound();
    }

    const isDebit = transaction.direction === "DEBIT";
    const isPending = transaction.status === "PENDING";
    const isSuccess = transaction.status === "COMPLETED";

    const dateObj = new Date(transaction.createdAt);
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Fallback for Site Name
    const bankName = settings.site_name || "TrustBank";

    const getStatusStyle = () => {
        if (isSuccess) return styles.success;
        if (isPending) return styles.pending;
        return styles.failed;
    };

    return (
        <div className={styles.container}>
            <div className={styles.headerNav}>
                <Link href="/dashboard/transactions" className={styles.backLink}>
                    <ChevronLeft size={18} /> Back to History
                </Link>
            </div>

            <div className={styles.receiptCard}>
                {/* 1. DYNAMIC BRAND HEADER */}
                <div className={styles.bankHeader}>
                    <span className={styles.bankName}>{bankName}</span>
                    <span className={styles.receiptLabel}>Transaction Receipt</span>
                </div>

                {/* 2. AMOUNT HERO */}
                <div className={styles.receiptHeader}>
                    <div className={`${styles.iconBox} ${getStatusStyle()}`}>
                        {isSuccess ? (isDebit ? <ArrowUpRight size={28} /> : <ArrowDownLeft size={28} />) :
                            isPending ? <Clock size={28} /> :
                                <AlertTriangle size={28} />}
                    </div>

                    <h1 className={`${styles.amount} ${isDebit ? '' : styles.creditText}`}>
                        {isDebit ? "-" : "+"}{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(transaction.amount))}
                    </h1>

                    <span className={`${styles.statusBadge} ${getStatusStyle()}`}>
                        {transaction.status === 'COMPLETED' ? 'Successful' : transaction.status}
                    </span>
                </div>

                <div className={styles.divider}></div>

                {/* 3. DETAILS */}
                <div className={styles.detailsList}>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Beneficiary / Source</span>
                        <span className={styles.valueHighlight}>{transaction.description}</span>
                    </div>

                    <div className={styles.detailRow}>
                        <span className={styles.label}>Transaction Date</span>
                        <div className={styles.multiValue}>
                            <span>{dateStr}</span>
                            <span className={styles.subValue}>{timeStr}</span>
                        </div>
                    </div>

                    <div className={styles.detailRow}>
                        <span className={styles.label}>Type</span>
                        <span className={styles.value}>{transaction.type.replace(/_/g, " ")}</span>
                    </div>

                    <div className={styles.detailRow}>
                        <span className={styles.label}>Reference</span>
                        <span className={styles.monoValue}>
                            {transaction.referenceId || `REF-${transaction.id.slice(-8).toUpperCase()}`}
                        </span>
                    </div>

                    <div className={styles.detailRow}>
                        <span className={styles.label}>Payment Method</span>
                        <span className={styles.value}>
                            {transaction.account.type} •• {transaction.account.accountNumber.slice(-4)}
                        </span>
                    </div>
                </div>

                {/* 4. ACTIONS */}
                <ReceiptActions styles={styles} />

                <div className={styles.disclaimer}>
                    This receipt is generated automatically and is valid without a signature.
                    <br />{bankName} Inc.
                </div>
            </div>
        </div>
    );
}