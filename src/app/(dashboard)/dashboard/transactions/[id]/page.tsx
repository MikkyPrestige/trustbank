import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/content/get-settings";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
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
            where: { id },
            include: { account: true },
        }),
        db.user.findUnique({
            where: { id: session.user.id },
            select: { currency: true, fullName: true }
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
    const isSuccess = transaction.status === "COMPLETED";
    const isPending = transaction.status === "PENDING" || transaction.status === "ON_HOLD";
    const isFailed = transaction.status === "FAILED" || transaction.status === "REVERSED";

    const dateObj = new Date(transaction.createdAt);
    const dateStr = dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const timeStr = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

    const now = new Date();
    const printedStr = now.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
        + " " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

    const bankName = settings.site_name || "TrustBank";
    const refCode = transaction.id.slice(-8).toUpperCase();
    const maskedAccount = `••••••••${transaction.account.accountNumber.slice(-4)}`;

    const statusLabel = isSuccess ? "SUCCESSFUL" : isFailed ? transaction.status === "REVERSED" ? "REVERSED" : "DECLINED" : "PENDING";
    const statusClass = isSuccess ? styles.statusSuccess : isFailed ? styles.statusFailed : styles.statusPending;

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.headerNav}>
                <Link href="/dashboard/transactions" className={styles.backLink}>
                    <ChevronLeft size={18} /> Back to History
                </Link>
            </div>

            <div className={styles.receiptCard}>

                {/* ── Bank Header ── */}
                <div className={styles.bankHeader}>
                    <div className={styles.brandCol}>
                        {settings.site_logo ? (
                            <div className={styles.logoWrap}>
                                <Image src={settings.site_logo} alt={bankName} fill className={styles.logoImg} priority sizes="160px" />
                            </div>
                        ) : (
                            <span className={styles.bankName}>{bankName.toUpperCase()}</span>
                        )}
                    </div>
                    <div className={styles.receiptMeta}>
                        <span className={styles.receiptTitle}>TRANSACTION RECEIPT</span>
                        <span className={styles.refNumber}>REF: {refCode}</span>
                    </div>
                </div>

                <div className={styles.dashedDivider} />

                {/* ── Amount hero ── */}
                <div className={styles.amountSection}>
                    <span className={`${styles.statusDot} ${statusClass}`}>{statusLabel}</span>
                    <div className={`${styles.amountHero} ${isDebit ? styles.amountDebit : styles.amountCredit} ${isFailed ? styles.amountStruck : ""}`}>
                        {isDebit ? "−" : "+"}{new Intl.NumberFormat("en-US", { style: "currency", currency }).format(convertedAmount)}
                    </div>
                    {currency !== "USD" && (
                        <span className={styles.usdEquiv}>
                            ≈ {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(transaction.amount))} USD
                        </span>
                    )}
                </div>

                <div className={styles.dashedDivider} />

                {/* ── Sender ── */}
                <div className={styles.section}>
                    <p className={styles.sectionTitle}>SENDER</p>
                    <div className={styles.row}>
                        <span className={styles.rowLabel}>NAME</span>
                        <span className={styles.rowValue}>{user?.fullName || "Account Holder"}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.rowLabel}>ACCOUNT TYPE</span>
                        <span className={styles.rowValue}>{transaction.account.type}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.rowLabel}>ACCOUNT NUMBER</span>
                        <span className={`${styles.rowValue} ${styles.mono}`}>{maskedAccount}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.rowLabel}>BANK</span>
                        <span className={styles.rowValue}>{bankName}</span>
                    </div>
                </div>

                <div className={styles.solidDivider} />

                {/* ── Transaction Details ── */}
                <div className={styles.section}>
                    <p className={styles.sectionTitle}>TRANSACTION DETAILS</p>
                    <div className={styles.row}>
                        <span className={styles.rowLabel}>DESCRIPTION</span>
                        <span className={`${styles.rowValue} ${styles.rowValueBold}`}>{transaction.description || "—"}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.rowLabel}>TYPE</span>
                        <span className={styles.rowValue}>{transaction.type.replace(/_/g, " ")}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.rowLabel}>DIRECTION</span>
                        <span className={styles.rowValue}>{isDebit ? "DEBIT" : "CREDIT"}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.rowLabel}>DATE</span>
                        <span className={styles.rowValue}>{dateStr}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.rowLabel}>TIME</span>
                        <span className={styles.rowValue}>{timeStr}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.rowLabel}>REFERENCE</span>
                        <span className={`${styles.rowValue} ${styles.mono}`}>{refCode}</span>
                    </div>
                    {currency !== "USD" && (
                        <div className={styles.row}>
                            <span className={styles.rowLabel}>EXCHANGE RATE</span>
                            <span className={styles.rowValue}>1 USD = {exchangeRate} {currency}</span>
                        </div>
                    )}
                </div>

                <div className={styles.dashedDivider} />

                {/* ── Actions ── */}
                <ReceiptActions />

                {/* ── Footer ── */}
                <div className={styles.receiptFooter}>
                    <div className={styles.fdic}>
                        <div className={styles.fdicBadge}>FDIC</div>
                        <span className={styles.fdicText}>Member FDIC. Deposits insured up to $250,000.</span>
                    </div>
                    <p className={styles.disclaimer}>
                        This receipt is generated automatically by {bankName} secure systems.
                        If you did not authorise this transaction, contact support immediately.
                    </p>
                    <p className={styles.printedOn}>Printed on {printedStr}</p>
                </div>
            </div>
        </div>
    );
}
