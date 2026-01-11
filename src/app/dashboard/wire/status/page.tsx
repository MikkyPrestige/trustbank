import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import ClearanceForm from "./ClearanceForm";
import styles from "./status.module.css";
import { ArrowLeft, CheckCircle } from "lucide-react";

export default async function WireStatusPage({
    searchParams,
}: {
    searchParams: Promise<{ id?: string }>;
}) {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const params = await searchParams;
    const selectedId = params?.id;

    // 1. IF ID SELECTED: Show Details / Clearance
    if (selectedId) {
        const wire = await db.wireTransfer.findUnique({
            where: { id: selectedId, userId: session.user.id }
        });

        if (!wire) {
            return (
                <div className={styles.container}>
                    <div className={styles.emptyState}>
                        <h2>Transaction Not Found</h2>
                        <Link href="/dashboard/wire/status" className={styles.backLink}>
                            <ArrowLeft size={16} /> Back to List
                        </Link>
                    </div>
                </div>
            );
        }

        // --- COMPLETED STATE ---
        if (wire.status === 'COMPLETED') {
            return (
                <div className={styles.container}>
                    <div style={{ marginBottom: '2rem' }}>
                        <Link href="/dashboard/wire/status" className={styles.backLink}>
                            <ArrowLeft size={16} /> Back to List
                        </Link>
                    </div>

                    <div className={styles.successCard}>
                        <div className={styles.successIcon}>
                            <CheckCircle size={48} strokeWidth={3} />
                        </div>
                        <h1 className={styles.successTitle}>Transfer Cleared</h1>
                        <p className={styles.successSubtitle}>
                            Funds have been successfully released to the beneficiary bank.
                        </p>

                        <div className={styles.receiptDetails}>
                            <div className={styles.receiptRow}>
                                <span>Reference ID</span>
                                <span>{wire.id.slice(-8).toUpperCase()}</span>
                            </div>
                            <div className={styles.receiptRow}>
                                <span>Beneficiary</span>
                                <span>{wire.bankName}</span>
                            </div>
                            <div className={styles.receiptRow}>
                                <span>Amount Sent</span>
                                <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(wire.amount))}</span>
                            </div>
                            <div className={styles.receiptRow}>
                                <span>Status</span>
                                <span style={{ color: '#22c55e' }}>CLEARED</span>
                            </div>
                            <div className={styles.receiptRow}>
                                <span>Date</span>
                                <span>{new Date(wire.updatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <Link href="/dashboard" className={styles.dashboardBtn}>
                            Return to Dashboard
                        </Link>
                    </div>
                </div>
            );
        }

        // --- PENDING STATE (Clearance Form) ---
        return (
            <div className={styles.container}>
                <div style={{ marginBottom: '2rem' }}>
                    <Link href="/dashboard/wire/status" className={styles.backLink}>
                        <ArrowLeft size={16} /> Back to Pending Wires
                    </Link>
                </div>

                <header className={styles.header}>
                    <h1 className={styles.title}>Clearance Required</h1>
                    <p className={styles.subtitle}>
                        Ref: <span className={styles.ref}>{wire.id.slice(-8).toUpperCase()}</span>
                    </p>
                </header>

                <div className={styles.statusCard}>
                    {/* Progress Bar */}
                    <div className={styles.progress}>
                        <div className={`${styles.step} ${styles.active}`}>Initiated</div>
                        <div className={`${styles.step} ${styles.active}`}>Processing</div>
                        <div className={styles.step}>Complete</div>
                    </div>

                    <div className={styles.details}>
                        <div className={styles.row}>
                            <span>Beneficiary Bank</span>
                            <strong>{wire.bankName}</strong>
                        </div>
                        <div className={styles.row}>
                            <span>Amount</span>
                            <strong>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(wire.amount))}</strong>
                        </div>
                        <div className={styles.row}>
                            <span>Current Status</span>
                            <strong className={styles.warning}>ON HOLD (Action Required)</strong>
                        </div>
                    </div>

                    <div className={styles.actionArea}>
                        <ClearanceForm
                            wire={{
                                ...wire,
                                amount: Number(wire.amount),
                                createdAt: wire.createdAt.toISOString(),
                                updatedAt: wire.updatedAt.toISOString()
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // 2. LIST VIEW (No ID selected)
    const pendingWires = await db.wireTransfer.findMany({
        where: {
            userId: session.user.id,
            status: 'PENDING_AUTH'
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Pending Approvals</h1>
                <p className={styles.subtitle}>Select a transaction to complete clearance.</p>
            </header>

            {pendingWires.length === 0 ? (
                <div className={styles.emptyState}>
                    <h2>All Clear</h2>
                    <p>You have no pending international transfers.</p>
                    <Link href="/dashboard/wire" className={styles.button} style={{ display: 'inline-block', marginTop: '1.5rem', width: 'auto', padding: '12px 24px', textDecoration: 'none' }}>
                        Start New Wire
                    </Link>
                </div>
            ) : (
                <div className={styles.listGrid}>
                    {pendingWires.map((wire) => (
                        <div key={wire.id} className={styles.wireCard}>
                            <div className={styles.wireInfo}>
                                <div className={styles.wireBank}>{wire.bankName}</div>
                                <div className={styles.wireDate}>{new Date(wire.createdAt).toLocaleDateString()}</div>
                                <div className={styles.wireAmount}>
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(wire.amount))}
                                </div>
                            </div>
                            <div className={styles.wireAction}>
                                <div className={styles.stageBadge}>{wire.currentStage} PENDING</div>
                                <div>
                                    <Link href={`/dashboard/wire/status?id=${wire.id}`} className={styles.resumeBtn}>
                                        Resolve →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}