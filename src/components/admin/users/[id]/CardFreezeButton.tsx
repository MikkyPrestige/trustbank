'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminFreezeCard, adminUnfreezeCard } from '@/actions/admin/restrictions';
import styles from './users.module.css';
import { Snowflake, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface CardFreezeButtonProps {
    cardId: string;
    lastFour: string;
    adminLocked: boolean;
}

export default function CardFreezeButton({ cardId, lastFour, adminLocked }: CardFreezeButtonProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [notifyViaTicket, setNotifyViaTicket] = useState(false);

    const handleUnfreeze = async () => {
        if (!confirm(`Unfreeze card ending in ${lastFour}?`)) return;
        setLoading(true);
        try {
            const res = await adminUnfreezeCard(cardId);
            if (res.success) {
                toast.success(res.message);
                router.refresh();
            } else {
                toast.error(res.message);
            }
        } catch (err) {
            toast.error("Connection failed");
        } finally {
            setLoading(false);
        }
    };

    const handleFreezeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("cardId", cardId);
        if (reason) formData.append("reason", reason);
        if (notifyViaTicket) formData.append("notifyViaTicket", "on");

        try {
            const res = await adminFreezeCard(formData);
            if (res.success) {
                toast.success(res.message);
                setIsOpen(false);
                router.refresh();
            } else {
                toast.error(res.message);
            }
        } catch (err) {
            toast.error("Connection failed");
        } finally {
            setLoading(false);
        }
    };

    if (adminLocked) {
        return (
            <button onClick={handleUnfreeze} disabled={loading} className={styles.viewBtn}>
                {loading ? <Loader2 className={styles.spin} size={14} /> : <Snowflake size={14} />} Unfreeze
            </button>
        );
    }

    return (
        <>
            <button onClick={() => setIsOpen(true)} className={styles.viewBtn}>
                <Snowflake size={14} /> Freeze
            </button>

            {isOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3>Freeze Card •••• {lastFour}</h3>
                            <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleFreezeSubmit} className={styles.form}>
                            <textarea
                                className={styles.modalTextarea}
                                placeholder="Reason (optional, shown to the user)"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={4}
                                autoFocus
                            />

                            <label className={styles.checkboxRow}>
                                <input
                                    type="checkbox"
                                    checked={notifyViaTicket}
                                    onChange={(e) => setNotifyViaTicket(e.target.checked)}
                                />
                                Also notify via support ticket
                            </label>

                            <button disabled={loading} className={styles.saveBtn}>
                                {loading ? <Loader2 className={styles.spin} size={18} /> : 'Freeze Card'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
