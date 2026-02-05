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

    const wire = await db.wireTransfer.findUnique({
        where: { id },
        include: { user: true }
    });

    if (!wire) return notFound();

    return (
        <div className={styles.container}>
            {/* HEADER */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Transaction Details</h1>
                    <p className={styles.subtitle}>ID: {wire.id}</p>
                </div>
                <div className={styles.headerActions}>
                    <Link href="/admin/wires" className={styles.backBtn}>
                        <ArrowLeft size={16} /> Back to List
                    </Link>
                </div>
            </header>

            <div className={styles.detailsGrid}>
                {/* LEFT COL: DETAILS */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Transfer Information</h3>

                    <div className={styles.detailRow}>
                        <div className={styles.iconBox}><DollarSign size={20} /></div>
                        <div>
                            <label>Amount</label>
                            <div className={styles.valueLarge}>
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(wire.amount))}
                            </div>
                        </div>
                    </div>

                    <div className={styles.detailRow}>
                        <div className={styles.iconBox}><Building2 size={20} /></div>
                        <div>
                            <label>Beneficiary Bank</label>
                            <div className={styles.value}>{wire.bankName}</div>
                            <div className={styles.subValue}>Account: {wire.accountNumber}</div>
                            <div className={styles.subValue}>SWIFT: {wire.swiftCode || 'N/A'}</div>
                        </div>
                    </div>

                    <div className={styles.detailRow}>
                        <div className={styles.iconBox}><User size={20} /></div>
                        <div>
                            <label>Sender (Client)</label>
                            <div className={styles.value}>{wire.user.fullName}</div>
                            <div className={styles.subValue}>{wire.user.email}</div>
                        </div>
                    </div>

                    <div className={styles.detailRow}>
                        <div className={styles.iconBox}><Calendar size={20} /></div>
                        <div>
                            <label>Date Initiated</label>
                            <div className={styles.value}>{new Date(wire.createdAt).toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COL: STATUS & ACTIONS */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Status & Controls</h3>

                    <div className={styles.statusBox}>
                        <label>Current Status</label>
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
                        <WireActions wire={wire} />
                    </div>
                </div>
            </div>
        </div>
    );
}