import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import ClearanceForm from "@/components/dashboard/wire/ClearanceForm";
import { ArrowLeft, CheckCircle, Clock, ShieldCheck, XCircle, ShieldAlert, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "../../../../../components/dashboard/wire/styles/status.module.css";
import { TransactionStatus } from "@prisma/client";

export default async function WireStatusPage({
    searchParams,
}: {
    searchParams: Promise<{ id?: string; page?: string }>;
}) {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const params = await searchParams;
    const selectedId = params?.id;

    // Fetch User Currency settings
    const [user, rates] = await Promise.all([
        db.user.findUnique({ where: { id: session.user.id }, select: { currency: true } }),
        db.exchangeRate.findMany()
    ]);

    const currency = user?.currency || "USD";
    const rate = currency === "USD" ? 1 : Number(rates.find(r => r.currency === currency)?.rate || 1);

    // PAGINATION SETTINGS
    const currentPage = Number(params?.page) || 1;
    const PAGE_SIZE = 5;

    // Helper: Display Formatter
    const formatMoney = (usdAmount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(usdAmount * rate);
    };

    // 1. DETAIL VIEW (If ID is selected)
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

        // --- STATE A: COMPLETED (Success) ---
        if (wire.status === TransactionStatus.COMPLETED) {
            return (
                <div className={styles.container}>
                    <div className={styles.header}>
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
                                <span>Amount Sent</span>
                                <span>{formatMoney(Number(wire.amount))}</span>
                            </div>
                            <div className={styles.receiptRow}>
                                <span>Status</span>
                                <span className={styles.textSuccess}>CLEARED</span>
                            </div>
                        </div>

                        <Link href="/dashboard" className={styles.dashboardBtn}>
                            Return to Dashboard
                        </Link>
                    </div>
                </div>
            );
        }

        // --- STATE B: PENDING / WAITING ---
        if (wire.status === TransactionStatus.PENDING_AUTH || wire.status === 'PENDING_APPROVAL' as any) {
            return (
                <div className={styles.container}>
                    <div className={styles.header}>
                        <Link href="/dashboard/wire/status" className={styles.backLink}>
                            <ArrowLeft size={16} /> Back to List
                        </Link>
                    </div>

                    <div className={`${styles.statusCard} ${styles.waitingCard}`}>
                        <div className={styles.waitingIconWrapper}>
                            <ShieldCheck size={32} />
                        </div>
                        <h1 className={styles.waitingTitle}>Verification Complete</h1>
                        <p className={styles.waitingSubtitle}>
                            You have successfully passed checks. Your transfer is in the final authorization queue.
                        </p>

                        <div className={styles.receiptDetails}>
                            <div className={styles.receiptRow}>
                                <span>Current Status</span>
                                <span className={styles.processingStatus}>
                                    <Clock size={14} /> Waiting for Approval
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // --- STATE C: REJECTED / FAILED / REVERSED ---
        if (wire.status === TransactionStatus.REVERSED || wire.status === TransactionStatus.FAILED) {

            const isReversed = wire.status === TransactionStatus.REVERSED;

            return (
                <div className={styles.container}>
                    <div className={styles.header}>
                        <Link href="/dashboard/wire/status" className={styles.backLink}>
                            <ArrowLeft size={16} /> Back to List
                        </Link>
                    </div>

                    <div className={isReversed ? `${styles.rejectedCard} ${styles.reversedCard}` : styles.rejectedCard}>

                        {/* Icon Wrapper */}
                        <div className={isReversed ? styles.reversedIconWrapper : styles.rejectedIcon}>
                            {isReversed ? (
                                <ShieldAlert size={48} strokeWidth={2} />
                            ) : (
                                <XCircle size={48} strokeWidth={3} />
                            )}
                        </div>

                        <h1 className={isReversed ? styles.reversedTitle : styles.rejectedTitle}>
                            {isReversed ? "Security Reversal" : "Transfer Rejected"}
                        </h1>

                        <p className={isReversed ? styles.reversedSubtitle : styles.successSubtitle}>
                            {isReversed
                                ? "System auto-reversed this transaction due to multiple failed verification attempts."
                                : "This transaction was declined by the compliance team."
                            }
                        </p>

                        <div className={styles.receiptDetails}>
                            <div className={styles.receiptRow}>
                                <span>Beneficiary</span>
                                <strong>{wire.bankName}</strong>
                            </div>
                            <div className={styles.receiptRow}>
                                <span>Amount</span>
                                <strong>{formatMoney(Number(wire.amount))}</strong>
                            </div>
                            <div className={styles.receiptRow}>
                                <span>Status</span>
                                <strong className={isReversed ? styles.textWarning : styles.textDanger}>
                                    {isReversed ? "VOIDED / REVERSED" : "DECLINED"}
                                </strong>
                            </div>
                        </div>

                        <div className={isReversed ? styles.reversedNoteBox : styles.reversedNote}>
                            Funds have been reversed to your account. <br />
                            Please contact support if you believe this is an error.
                        </div>

                        <Link href="/dashboard/support" className={styles.supportBtn}>
                            Contact Support
                        </Link>
                    </div>
                </div>
            );
        }

        // --- STATE D: ON HOLD ---
        if (wire.status === TransactionStatus.ON_HOLD) {
            return (
                <div className={styles.container}>
                    <div className={styles.header}>
                        <Link href="/dashboard/wire/status" className={styles.backLink}>
                            <ArrowLeft size={16} /> Back to Pending Wires
                        </Link>
                    </div>

                    <div className={styles.header}>
                        <h1 className={styles.title}>Clearance Required</h1>
                        <p className={styles.subtitle}>
                            Ref: <span className={styles.ref}>{wire.id.slice(-8).toUpperCase()}</span>
                        </p>
                    </div>

                    <div className={styles.statusCard}>
                        <div className={styles.progress}>
                            <div className={`${styles.step} ${styles.active}`}>Initiated</div>
                            <div className={`${styles.step} ${styles.active}`}>Processing</div>
                            <div className={styles.step}>Complete</div>
                        </div>

                        <div className={styles.receiptDetails}>
                            <div className={styles.receiptRow}>
                                <span>Amount</span>
                                <span>{formatMoney(Number(wire.amount))}</span>
                            </div>
                            <div className={styles.receiptRow}>
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

        // --- FALLBACK ---
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <AlertTriangle size={48} className={styles.textWarning} />
                    <h2>Processing Transaction</h2>
                    <p>Status: {wire.status}</p>
                    <Link href="/dashboard" className={styles.button}>Return Home</Link>
                </div>
            </div>
        )
    }

    // 2. LIST VIEW (No ID selected)
    const whereClause = {
        userId: session.user.id,
        status: { in: [TransactionStatus.ON_HOLD, TransactionStatus.PENDING_AUTH, TransactionStatus.REVERSED, TransactionStatus.FAILED] }
    };

    // Calculate pagination values
    const totalCount = await db.wireTransfer.count({ where: whereClause });
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    // Ensure page is within valid range
    const validPage = Math.max(1, Math.min(currentPage, totalPages || 1));
    const skip = (validPage - 1) * PAGE_SIZE;

    const pendingWires = await db.wireTransfer.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: PAGE_SIZE,
        skip: skip
    });

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Pending Approvals</h1>
                <p className={styles.subtitle}>Track your international transfers.</p>
            </header>

            {pendingWires.length === 0 ? (
                <div className={styles.emptyState}>
                    <h2>All Clear</h2>
                    <p>You have no pending international transfers.</p>
                    <Link href="/dashboard/wire" className={styles.button}>
                        Start New Wire
                    </Link>
                </div>
            ) : (
                <>
                    <div className={styles.listGrid}>
                        {pendingWires.map((wire) => {
                            const isActionRequired = wire.status === TransactionStatus.ON_HOLD;
                            const isReversed = wire.status === TransactionStatus.REVERSED;
                            const isFailed = wire.status === TransactionStatus.FAILED;

                            return (
                                <div key={wire.id} className={styles.wireCard}>
                                    <div className={styles.wireInfo}>
                                        <div className={styles.wireBank}>{wire.bankName}</div>
                                        <div className={styles.wireDate}>{new Date(wire.createdAt).toLocaleDateString()}</div>
                                        <div className={styles.wireAmount}>
                                            {formatMoney(Number(wire.amount))}
                                        </div>
                                    </div>
                                    <div className={styles.wireAction}>
                                        <div className={`${styles.stageBadge} ${isActionRequired ? styles.badgeAction :
                                            isReversed ? styles.badgeWarning :
                                                isFailed ? styles.badgeDanger :
                                                    styles.badgeWaiting
                                            }`}>
                                            {isActionRequired ? `${wire.currentStage} PENDING` :
                                                isReversed ? 'SECURITY BLOCK' :
                                                    isFailed ? 'DECLINED' :
                                                        'WAITING APPROVAL'}
                                        </div>
                                        <div>
                                            <Link href={`/dashboard/wire/status?id=${wire.id}`} className={styles.resumeBtn}>
                                                {isActionRequired ? 'Resolve →' : 'View Status'}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* PAGINATION CONTROLS */}
                    {totalPages > 1 && (
                        <div className={styles.pagination}>
                            <Link
                                href={validPage > 1 ? `?page=${validPage - 1}` : '#'}
                                className={`${styles.pageBtn} ${validPage <= 1 ? styles.disabled : ''}`}
                            >
                                <ChevronLeft size={16} /> Prev
                            </Link>

                            <span className={styles.pageInfo}>
                                Page {validPage} of {totalPages}
                            </span>

                            <Link
                                href={validPage < totalPages ? `?page=${validPage + 1}` : '#'}
                                className={`${styles.pageBtn} ${validPage >= totalPages ? styles.disabled : ''}`}
                            >
                                Next <ChevronRight size={16} />
                            </Link>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}