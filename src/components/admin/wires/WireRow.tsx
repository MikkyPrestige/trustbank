'use client';

import { useState } from 'react';
import { adminRejectWire, adminCompleteWire } from '@/actions/admin/wire';
import CodeModal from './CodeModal';
import { Key, XCircle, CheckCircle, Loader2, Clock } from 'lucide-react';
import styles from './wires.module.css';
import toast from 'react-hot-toast';
import { WireTransfer, User } from '@prisma/client';
import { useRouter } from 'next/navigation';

type WireWithUser = WireTransfer & { user: User };

interface WireRowProps {
    wire: WireWithUser;
    currency?: string;
    rate?: number;
}

export default function WireRow({ wire, currency = "USD", rate = 1 }: WireRowProps) {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const stopProp = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    // Calculate Display Values
    const amountNative = Number(wire.amount) * rate;
    const feeNative = Number(wire.fee) * rate;

    // 1. REJECT LOGIC
    const handleReject = async (e: React.MouseEvent) => {
        stopProp(e);
        if (!confirm("REJECT & REFUND?\n\nThis will release the held funds back to the user. Are you sure?")) return;

        setLoading(true);
        try {
            const res = await adminRejectWire(wire.id);
            if (res.success) {
                toast.success(res.message);
                router.refresh();
            } else {
                toast.error(res.message);
            }
        } catch (err) {
            toast.error("Failed to process refund");
        } finally {
            setLoading(false);
        }
    };

    // 2. APPROVE LOGIC
    const handleApprove = async (e: React.MouseEvent) => {
        stopProp(e);
        const msg = wire.status === 'PENDING_AUTH'
            ? "FINAL APPROVAL\n\nUser has passed clearance. This will settle the funds now."
            : "MANUAL OVERRIDE\n\nAre you sure you want to force-approve this pending wire?";

        if (!confirm(msg)) return;

        setLoading(true);
        try {
            const res = await adminCompleteWire(wire.id);
            if (res.success) {
                toast.success(res.message);
                router.refresh();
            } else {
                toast.error(res.message);
            }
        } catch (err) {
            toast.error("Failed to complete transfer");
        } finally {
            setLoading(false);
        }
    };

    // Determine State Helpers
    const isHold = wire.status === 'ON_HOLD';
    const isReadyForApproval = wire.status === 'PENDING_AUTH';
    const isFailed = wire.status === 'FAILED';
    const isReversed = wire.status === 'REVERSED';
    const isCompleted = wire.status === 'COMPLETED';
    const isActive = (isHold || isReadyForApproval) && !isFailed && !isReversed && !isCompleted;

    return (
        <>
            <tr className={styles.row} onClick={() => router.push(`/admin/wires/${wire.id}`)} style={{ cursor: 'pointer' }}>
                {/* 1. DATE */}
                <td className={styles.dateCell}>
                    <div>{new Date(wire.createdAt).toLocaleDateString()}</div>
                    <span className={styles.time}>
                        {new Date(wire.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </td>

                {/* 2. USER */}
                <td className={styles.userCell}>
                    <div className={styles.userName}>{wire.user.fullName || 'Unknown User'}</div>
                    <div className={styles.userEmail}>{wire.user.email}</div>
                </td>

                {/* 3. BANK */}
                <td className={styles.infoCell}>
                    <div className={styles.bankName}>{wire.bankName}</div>
                    <div className={styles.accNum}>{wire.accountNumber}</div>
                </td>

                {/* 4. AMOUNT */}
                <td className={styles.amountCell}>
                    <div style={{ fontWeight: 600 }}>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amountNative)}
                    </div>

                    {currency !== 'USD' && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            ≈ {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(wire.amount))}
                        </div>
                    )}

                    {Number(wire.fee) > 0 && (
                        <div className={styles.feeText}>
                            + {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(feeNative)} Fee
                        </div>
                    )}
                </td>

                {/* 5. STAGE / STATUS */}
                <td>
                    {isReadyForApproval ? (
                        <span className={`${styles.badge} ${styles.badgeWarning}`}>
                            <Clock size={12} /> WAITING APPROVAL
                        </span>
                    ) : (
                        <span className={`${styles.badge} ${isCompleted ? styles.badgeSuccess :
                            isFailed ? styles.badgeFailed :
                                isReversed ? styles.badgeReversed :
                                    styles.badgePending
                            }`}>
                            {wire.status === 'ON_HOLD' ? `CLEARANCE: ${wire.currentStage}` :
                                isReversed ? 'SECURITY BLOCK' :
                                    wire.status}
                        </span>
                    )}
                </td>

                {/* 6. ACTIONS */}
                <td>
                    <div className={styles.actions}>
                        {isActive ? (
                            <>
                                <button
                                    onClick={(e) => { stopProp(e); setShowModal(true); }}
                                    className={styles.btnCode}
                                    title="Manage Clearance Codes"
                                    disabled={loading}
                                >
                                    <Key size={14} />
                                </button>

                                <button
                                    onClick={handleApprove}
                                    disabled={loading}
                                    className={`${styles.btnApprove} ${isReadyForApproval ? styles.btnApproveReady : ''}`}
                                    title="Approve & Finalize"
                                >
                                    {loading ? <Loader2 className={styles.spin} size={16} /> : <CheckCircle size={16} />}
                                </button>

                                <button
                                    onClick={handleReject}
                                    disabled={loading}
                                    className={styles.btnReject}
                                    title="Reject & Refund"
                                >
                                    {loading ? <Loader2 className={styles.spin} size={16} /> : <XCircle size={16} />}
                                </button>
                            </>
                        ) : (
                            <span className={styles.doneText}>—</span>
                        )}
                    </div>
                </td>
            </tr>

            {showModal && (
                <CodeModal wire={wire} onClose={() => setShowModal(false)} />
            )}
        </>
    );
}