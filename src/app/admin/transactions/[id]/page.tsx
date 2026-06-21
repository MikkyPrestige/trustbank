export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/content/get-settings";
import { requireAdmin } from "@/lib/auth/admin-auth";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import styles from "./adminReceipt.module.css";
import ReceiptActions from "@/components/dashboard/transactions/[id]/ReceiptActions";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function AdminTransactionReceiptPage({ params }: PageProps) {
    const { id } = await params;
    await requireAdmin();
    const session = await auth();

    const [entry, settings] = await Promise.all([
        db.ledgerEntry.findUnique({
            where: { id },
            include: {
                account: {
                    include: {
                        user: { select: { fullName: true, currency: true, id: true } }
                    }
                }
            }
        }),
        getSiteSettings()
    ]);

    if (!entry) return notFound();

    const user = entry.account.user;
    const currency = user.currency || "USD";
    let exchangeRate = 1;
    if (currency !== "USD") {
        const rateData = await db.exchangeRate.findUnique({ where: { currency } });
        if (rateData) exchangeRate = Number(rateData.rate);
    }

    const convertedAmount = Number(entry.amount) * exchangeRate;
    const isDebit = entry.direction === "DEBIT";
    const isSuccess = entry.status === "COMPLETED";
    const isPending = entry.status === "PENDING" || entry.status === "ON_HOLD";
    const isFailed = entry.status === "FAILED" || entry.status === "REVERSED";

    const dateObj = new Date(entry.createdAt);
    const dateStr = dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const timeStr = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

    const now = new Date();
    const printedStr = now.toLocaleDateString("en-US", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
    }) + " " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

    const bankName = settings.site_name || "TrustBank";
    const refCode = entry.id.slice(-8).toUpperCase();
    const maskedAccount = `••••••••${entry.account.accountNumber.slice(-4)}`;

    const statusLabel = isSuccess ? "SUCCESSFUL" : isFailed
        ? (entry.status === "REVERSED" ? "REVERSED" : "DECLINED")
        : "PENDING";
    const statusClass = isSuccess ? styles.statusSuccess : isFailed ? styles.statusFailed : styles.statusPending;

    let adminNote: string | null = null;
    if (entry.metadata) {
        try {
            const meta = JSON.parse(entry.metadata as string);
            if (meta.adminId) adminNote = `Administrative action by staff (ID: ${meta.adminId})`;
        } catch { }
    }

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.headerNav}>
                <Link href={`/admin/users/${user.id}/transactions`} className={styles.backLink}>
                    <ChevronLeft size={18} /> Back to Transactions
                </Link>
            </div>

            <div className={styles.receiptCard}>

                {/* Admin indicator banner */}
                <div className={styles.adminBanner}>
                    <ShieldCheck size={15} />
                    Admin View — {session?.user?.email}
                </div>

                {/* Bank header */}
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

                {/* Amount hero */}
                <div className={styles.amountSection}>
                    <span className={`${styles.statusDot} ${statusClass}`}>{statusLabel}</span>
                    <div className={`${styles.amountHero} ${isDebit ? styles.amountDebit : styles.amountCredit} ${isFailed ? styles.amountStruck : ""}`}>
                        {isDebit ? "−" : "+"}{new Intl.NumberFormat("en-US", { style: "currency", currency }).format(convertedAmount)}
                    </div>
                    {currency !== "USD" && (
                        <span className={styles.usdEquiv}>
                            ≈ {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(entry.amount))} USD
                        </span>
                    )}
                </div>

                <div className={styles.dashedDivider} />

                {/* Account holder */}
                <div className={styles.section}>
                    <p className={styles.sectionTitle}>ACCOUNT HOLDER</p>
                    <div className={styles.row}>
                        <span className={styles.rowLabel}>NAME</span>
                        <span className={styles.rowValue}>{user.fullName}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.rowLabel}>ACCOUNT TYPE</span>
                        <span className={styles.rowValue}>{entry.account.type}</span>
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

                {/* Transaction details */}
                <div className={styles.section}>
                    <p className={styles.sectionTitle}>TRANSACTION DETAILS</p>
                    <div className={styles.row}>
                        <span className={styles.rowLabel}>DESCRIPTION</span>
                        <span className={`${styles.rowValue} ${styles.rowValueBold}`}>{entry.description || "—"}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.rowLabel}>TYPE</span>
                        <span className={styles.rowValue}>{entry.type.replace(/_/g, " ")}</span>
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
                    {entry.referenceId && (
                        <div className={styles.row}>
                            <span className={styles.rowLabel}>INTERNAL REF</span>
                            <span className={`${styles.rowValue} ${styles.mono}`}>{entry.referenceId}</span>
                        </div>
                    )}
                    {currency !== "USD" && (
                        <div className={styles.row}>
                            <span className={styles.rowLabel}>EXCHANGE RATE</span>
                            <span className={styles.rowValue}>1 USD = {exchangeRate} {currency}</span>
                        </div>
                    )}
                </div>

                {adminNote && (
                    <div className={styles.adminNote}>
                        <div className={styles.solidDivider} />
                        <div className={styles.section}>
                            <p className={styles.sectionTitle}>ADMINISTRATIVE NOTE</p>
                            <div className={styles.row}>
                                <span className={styles.rowLabel}>NOTE</span>
                                <span className={styles.rowValue}>{adminNote}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className={styles.dashedDivider} />

                <ReceiptActions />

                {/* Footer */}
                <div className={styles.receiptFooter}>
                    <div className={styles.fdic}>
                        <div className={styles.fdicBadge}>FDIC</div>
                        <span className={styles.fdicText}>Member FDIC. Deposits insured up to $250,000.</span>
                    </div>
                    <p className={styles.disclaimer}>
                        This is an administrative receipt generated by {bankName} staff systems.
                        For audit purposes only — not for distribution to account holders.
                    </p>
                    <p className={styles.printedOn}>Printed on {printedStr}</p>
                </div>
            </div>
        </div>
    );
}
