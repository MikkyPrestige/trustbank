import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, User, Calendar, DollarSign, Activity } from "lucide-react";
import styles from "../../../../components/admin/wires/wires.module.css";
import WireActions from "@/components/admin/wires/WireActions";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function WireDetailsPage({ params }: PageProps) {
    const { id } = await params;

    const [wire, rates] = await Promise.all([
        db.wireTransfer.findUnique({
            where: { id },
            include: {
                user: {
                    select: { fullName: true, email: true, currency: true }
                }
            }
        }),
        db.exchangeRate.findMany()
    ]);

    if (!wire) return notFound();

    // @ts-ignore
    const currency = wire.user.currency || "USD";
    const exchangeRate = currency === "USD"
        ? 1
        : Number(rates.find(r => r.currency === currency)?.rate || 1);

    const amountNative = Number(wire.amount) * exchangeRate;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerActions}>
                    <Link href="/admin/wires" className={styles.backBtn}>
                        <ArrowLeft size={16} /> Back to List
                    </Link>
                </div>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Transaction Details</h1>
                    <p className={styles.subtitle}>ID: {wire.id}</p>
                </div>
            </header>

            <div className={styles.detailsGrid}>
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Transfer Information</h3>

                    <div className={styles.detailRow}>
                        <div className={styles.iconBox}><DollarSign size={20} /></div>
                        <div>
                            <label className={styles.label}>Amount</label>
                            <div className={styles.valueLarge}>
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amountNative)}
                            </div>
                            {currency !== "USD" && (
                                <div className={styles.subValue}>
                                    System Value: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(wire.amount))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.detailRow}>
                        <div className={styles.iconBox}><Building2 size={20} /></div>
                        <div>
                            <label className={styles.label}>Beneficiary Bank</label>
                            <div className={styles.value}>{wire.bankName}</div>
                            <div className={styles.subValue}>Account: {wire.accountNumber}</div>
                            <div className={styles.subValue}>SWIFT: {wire.swiftCode || 'N/A'}</div>
                        </div>
                    </div>

                    <div className={styles.detailRow}>
                        <div className={styles.iconBox}><User size={20} /></div>
                        <div>
                            <label className={styles.label}>Sender (Client)</label>
                            <div className={styles.value}>{wire.user.fullName}</div>
                            <div className={styles.subValue}>{wire.user.email}</div>
                        </div>
                    </div>

                    <div className={styles.detailRow}>
                        <div className={styles.iconBox}><Calendar size={20} /></div>
                        <div>
                            <label className={styles.label}>Date Initiated</label>
                            <div className={styles.value}>{new Date(wire.createdAt).toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Status & Controls</h3>
                    <div className={styles.statusBox}>
                        <label className={styles.label}>Current Status</label>
                        <div className={`${styles.statusBadgeLarge} ${wire.status === 'COMPLETED' ? styles.bgSuccess :
                            wire.status === 'FAILED' ? styles.bgFailed :
                                wire.status === 'REVERSED' ? styles.bgReversed :
                                    styles.bgPending
                            }`}>
                            <Activity size={18} />
                            {wire.status}
                        </div>
                        {wire.status === 'ON_HOLD' && (
                            <p className={styles.stageText}>Current Stage: <strong>{wire.currentStage}</strong></p>
                        )}
                    </div>

                    <div className={styles.actionsWrapper}>
                        {/* @ts-ignore */}
                        <WireActions wire={wire} />
                    </div>
                </div>
            </div>
        </div>
    );
}
