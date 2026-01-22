import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import styles from "../../../../../components/dashboard/transactions/[id]/receipt.module.css";
import ReceiptActions from "@/components/dashboard/transactions/[id]/ReceiptActions";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function TransactionDetailsPage({ params }: PageProps) {
    const { id } = await params; // Await params

    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const transaction = await db.ledgerEntry.findUnique({
        where: { id: id },
        include: {
            account: true,
        },
    });

    if (!transaction) return notFound();

    const userOwnsAccount = transaction.account.userId === session.user.id;
    if (!userOwnsAccount) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>Unauthorized</h2>
                <p>You do not have permission to view this receipt.</p>
                <Link href="/dashboard" style={{ color: 'blue' }}>Go Back</Link>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        if (status === "COMPLETED") return styles.success;
        if (status === "PENDING") return styles.pending;
        return styles.failed;
    };

    const isDebit = transaction.direction === "DEBIT";

    return (
        <div className={styles.container}>
            <div className={styles.headerNav}>
                <Link href="/dashboard" className={styles.backLink}>
                    <ChevronLeft size={20} /> Back to Dashboard
                </Link>
            </div>

            <div className={styles.receiptCard}>
                {/* HEADER */}
                <div className={styles.receiptHeader}>
                    <div className={`${styles.iconBox} ${getStatusColor(transaction.status)}`}>
                        {transaction.status === "COMPLETED" ? <CheckCircle size={32} /> :
                            transaction.status === "PENDING" ? <Clock size={32} /> : <AlertTriangle size={32} />}
                    </div>
                    <h1 className={styles.amount}>
                        {isDebit ? "-" : "+"}
                        ${Number(transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h1>
                    <span className={`${styles.statusBadge} ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                    </span>
                </div>

                <div className={styles.divider}></div>

                {/* DETAILS */}
                <div className={styles.detailsList}>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Description</span>
                        <span className={styles.value}>{transaction.description}</span>
                    </div>

                    <div className={styles.detailRow}>
                        <span className={styles.label}>Transaction Type</span>
                        <span className={styles.value}>{transaction.type.replace("_", " ")}</span>
                    </div>

                    <div className={styles.detailRow}>
                        <span className={styles.label}>Date & Time</span>
                        <span className={styles.value}>
                            {new Date(transaction.createdAt).toLocaleString()}
                        </span>
                    </div>

                    <div className={styles.detailRow}>
                        <span className={styles.label}>Reference ID</span>
                        <span className={styles.monoValue}>{transaction.referenceId || transaction.id}</span>
                    </div>

                    <div className={styles.detailRow}>
                        <span className={styles.label}>Account</span>
                        <span className={styles.value}>
                            {transaction.account.type} •••• {transaction.account.accountNumber.slice(-4)}
                        </span>
                    </div>
                </div>

                <ReceiptActions styles={styles} />

                <div className={styles.logoWatermark}>TrustBank</div>
            </div>
        </div>
    );
}