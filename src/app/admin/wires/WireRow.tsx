'use client';

import { useState } from 'react';
import { adminRejectWire } from '@/actions/admin-wires';
import CodeModal from './CodeModal';
import { Eye, XCircle, Key } from 'lucide-react';
import styles from './wires.module.css';

export default function WireRow({ wire }: { wire: any }) {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleReject = async () => {
        if (!confirm("⚠️ This will REFUND the user and cancel the wire. Are you sure?")) return;
        setLoading(true);
        const res = await adminRejectWire(wire.id);
        setLoading(false);
        if (res.success) alert("Refunded successfully");
        else alert(res.message);
    };

    const isPending = wire.status === 'PENDING_AUTH';

    return (
        <>
            <tr className={styles.row}>
                <td>
                    <div className={styles.user}>{wire.user.fullName}</div>
                    <div className={styles.email}>{wire.user.email}</div>
                </td>
                <td>
                    <div className={styles.bank}>{wire.bankName}</div>
                    <div className={styles.tiny}>{wire.accountNumber}</div>
                </td>
                <td>
                    <span className={styles.amount}>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(wire.amount))}
                    </span>
                </td>
                <td>
                    <span className={`${styles.badge} ${styles[wire.status]}`}>
                        {wire.status === 'PENDING_AUTH' ? `${wire.currentStage} WAIT` : wire.status}
                    </span>
                </td>
                <td>
                    <div className={styles.actions}>
                        {isPending && (
                            <>
                                <button
                                    onClick={() => setShowModal(true)}
                                    className={styles.keyBtn}
                                    title="Set Clearance Code"
                                >
                                    <Key size={16} /> Code
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={loading}
                                    className={styles.rejectBtn}
                                    title="Reject & Refund"
                                >
                                    <XCircle size={16} />
                                </button>
                            </>
                        )}
                        {!isPending && <span className={styles.done}>—</span>}
                    </div>
                </td>
            </tr>

            {showModal && (
                <CodeModal wire={wire} onClose={() => setShowModal(false)} />
            )}
        </>
    );
}