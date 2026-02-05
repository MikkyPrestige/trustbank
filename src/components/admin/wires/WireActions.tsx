'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminRejectWire, adminCompleteWire } from '@/actions/admin/wire';
import CodeModal from './CodeModal';
import { Key, XCircle, CheckCircle, Loader2 } from 'lucide-react';
import styles from './wires.module.css';
import toast from 'react-hot-toast';

export default function WireActions({ wire }: { wire: any }) {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleReject = async () => {
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
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!confirm("Confirm Final Approval?")) return;
        setLoading(true);
        try {
            const res = await adminCompleteWire(wire.id);
            if (res.success) {
                toast.success(res.message);
                router.refresh();
            } else {
                toast.error(res.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const isHold = wire.status === 'ON_HOLD';
    const isReady = wire.status === 'PENDING_AUTH';
    const isActive = (isHold || isReady) && wire.status !== 'FAILED' && wire.status !== 'REVERSED';

    if (!isActive) return <div className={styles.closedMessage}>Transaction Closed</div>;

    return (
        <div className={styles.actionButtonsCol}>
            <button onClick={() => setShowModal(true)} disabled={loading} className={`${styles.btnFull} ${styles.btnCode}`}>
                <Key size={18} /> Manage Codes
            </button>

            <button onClick={handleApprove} disabled={loading} className={`${styles.btnFull} ${styles.btnApprove}`}>
                {loading ? <Loader2 className={styles.spin} /> : <CheckCircle size={18} />} Approve Transfer
            </button>

            <button onClick={handleReject} disabled={loading} className={`${styles.btnFull} ${styles.btnReject}`}>
                {loading ? <Loader2 className={styles.spin} /> : <XCircle size={18} />} Reject & Refund
            </button>

            {showModal && <CodeModal wire={wire} onClose={() => setShowModal(false)} />}
        </div>
    );
}