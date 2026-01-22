'use client';

import { useState } from 'react';
import { adminRejectWire, adminCompleteWire } from '@/actions/admin/wire';
import CodeModal from './CodeModal';
import { Key, XCircle, CheckCircle, Loader2 } from 'lucide-react';
import styles from './wires.module.css';
import toast from 'react-hot-toast';

export default function WireRow({ wire }: { wire: any }) {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // 1. REJECT LOGIC
    const handleReject = async () => {
        if (!confirm("⚠️ REJECT & REFUND?\n\nThis will return funds to the user. Are you sure?")) return;

        setLoading(true);
        try {
            const res = await adminRejectWire(wire.id);
            if (res.success) {
                toast.success(res.message);
                window.location.reload();
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
    const handleApprove = async () => {
        if (!confirm("✅ APPROVE TRANSFER?\n\nThis will finalize the transaction and deduct the Current Balance.")) return;

        setLoading(true);
        try {
            const res = await adminCompleteWire(wire.id);
            if (res.success) {
                toast.success(res.message);
                window.location.reload();
            } else {
                toast.error(res.message);
            }
        } catch (err) {
            toast.error("Failed to complete transfer");
        } finally {
            setLoading(false);
        }
    };

    const isPending = wire.status === 'PENDING_AUTH';

    return (
        <>
            <tr>
                <td style={{ color: '#666', fontSize: '0.85rem' }}>
                    {new Date(wire.createdAt).toLocaleDateString()}
                </td>
                <td className={styles.userCell}>
                    <div>{wire.user.fullName}</div>
                    <div>{wire.user.email}</div>
                </td>
                <td className={styles.userCell}>
                    <div>{wire.bankName}</div>
                    <div>{wire.accountNumber}</div>
                </td>
                <td style={{ fontWeight: 'bold', color: '#fff' }}>
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(wire.amount))}
                </td>
                <td>
                    <span className={`${styles.badge} ${wire.status === 'PENDING_AUTH' ? styles.badgePending : wire.status === 'COMPLETED' ? styles.badgeSuccess : styles.badgeFailed}`}>
                        {wire.status === 'PENDING_AUTH' ? `${wire.currentStage} CHECK` : wire.status}
                    </span>
                </td>
                <td>
                    <div className={styles.actions}>
                        {isPending ? (
                            <>
                                {/* SET CODE BUTTON */}
                                <button
                                    onClick={() => setShowModal(true)}
                                    className={styles.btnCode}
                                    title="Set Clearance Code"
                                    disabled={loading}
                                >
                                    <Key size={14} /> Set Code
                                </button>

                                {/* APPROVE BUTTON (CLEAN NOW) */}
                                <button
                                    onClick={handleApprove}
                                    disabled={loading}
                                    className={styles.btnApprove} // <--- USING CLASS NOW
                                    title="Approve & Finalize"
                                >
                                    {loading ? <Loader2 className={styles.spin} size={16} /> : <CheckCircle size={16} />}
                                </button>

                                {/* REJECT BUTTON */}
                                <button
                                    onClick={handleReject}
                                    disabled={loading}
                                    className={styles.btnReject}
                                    title="Reject & Refund"
                                >
                                    {loading ? <Loader2 className={styles.spin} size={14} /> : <XCircle size={16} />}
                                </button>
                            </>
                        ) : (
                            <span style={{ color: '#444' }}>—</span>
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