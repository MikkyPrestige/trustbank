import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/content/get-settings";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Clock, AlertTriangle, ArrowDownLeft, ArrowUpRight, XCircle } from "lucide-react";
import styles from "../../../../../components/dashboard/transactions/[id]/receipt.module.css";
import ReceiptActions from "@/components/dashboard/transactions/[id]/ReceiptActions";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function TransactionDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const [transaction, user, settings] = await Promise.all([
        db.ledgerEntry.findUnique({
            where: { id: id },
            include: { account: true },
        }),
        db.user.findUnique({
            where: { id: session.user.id },
            select: { currency: true }
        }),
        getSiteSettings()
    ]);

    if (!transaction || transaction.account.userId !== session.user.id) return notFound();

    const currency = user?.currency || "USD";
    let exchangeRate = 1;
    if (currency !== "USD") {
        const rateData = await db.exchangeRate.findUnique({ where: { currency } });
        if (rateData) exchangeRate = Number(rateData.rate);
    }

    const convertedAmount = Number(transaction.amount) * exchangeRate;

    const isDebit = transaction.direction === "DEBIT";
    const isPending = transaction.status === "PENDING" || transaction.status === "ON_HOLD";
    const isSuccess = transaction.status === "COMPLETED";
    const isFailed = transaction.status === 'FAILED' || transaction.status === 'REVERSED';

    const dateObj = new Date(transaction.createdAt);
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const bankName = settings.site_name || "TrustBank";

    const getStatusStyle = () => {
        if (isFailed) return styles.failed;
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
                <div className={styles.bankHeader}>
                    <div className={styles.brandColumn}>
                        {settings.site_logo ? (
                            <div className={styles.logoContainer}>
                                <Image
                                    src={settings.site_logo}
                                    alt={bankName}
                                    fill
                                    className={styles.logoImage}
                                    priority
                                    sizes="200px"
                                />
                            </div>
                        ) : (
                            <h2 className={styles.bankName}>{bankName}</h2>
                        )}
                    </div>

                    <div className={styles.headerRight}>
                        <span className={styles.receiptLabel}>Transaction Receipt</span>
                        <span className={styles.receiptId}>#{transaction.id.slice(-8).toUpperCase()}</span>
                    </div>
                </div>


                <div className={styles.receiptHeader}>
                    <div className={`${styles.iconBox} ${getStatusStyle()}`}>
                        {isFailed ? <XCircle size={28} /> :
                            isSuccess ? (isDebit ? <ArrowUpRight size={28} /> : <ArrowDownLeft size={28} />) :
                                isPending ? <Clock size={28} /> :
                                    <AlertTriangle size={28} />}
                    </div>

                    <h1
                        className={`${styles.amount} ${isDebit ? '' : styles.creditText}`}
                        style={isFailed ? { textDecoration: 'line-through', color: 'var(--text-muted)' } : {}}
                    >
                        {isDebit ? "-" : "+"}{new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(convertedAmount)}
                    </h1>

                    <span className={`${styles.statusBadge} ${getStatusStyle()}`}>
                        {transaction.status === 'COMPLETED' ? 'Successful' :
                            isFailed ? 'Declined / Voided' :
                                transaction.status.replace(/_/g, ' ')}
                    </span>
                </div>

                <div className={styles.divider}></div>

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

                    {currency !== "USD" && (
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Exchange Rate Applied</span>
                            <span className={styles.value}>1 USD = {exchangeRate} {currency}</span>
                        </div>
                    )}

                    <div className={styles.detailRow}>
                        <span className={styles.label}>Type</span>
                        <span className={styles.value}>{transaction.type.replace(/_/g, " ")}</span>
                    </div>

                    <div className={styles.detailRow}>
                        <span className={styles.label}>Payment Method</span>
                        <span className={styles.value}>
                            {transaction.account.type} •• {transaction.account.accountNumber.slice(-4)}
                        </span>
                    </div>
                </div>

                <ReceiptActions />

                <div className={styles.disclaimer}>
                    This receipt is generated automatically by {bankName} Systems.
                </div>
            </div>
        </div>
    );
}
