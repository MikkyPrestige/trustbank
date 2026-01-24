'use client';

import { useState } from 'react';
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { processKyc } from '@/actions/admin/kyc';
import { Check, X, AlertTriangle } from 'lucide-react';
import styles from './users.module.css';

export default function KycReviewSection({ user }: { user: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectInput, setShowRejectInput] = useState(false);

    if (user.kycStatus !== 'PENDING') return null;

    const handleAction = async (decision: 'APPROVE' | 'REJECT') => {
        if (decision === 'REJECT' && !showRejectInput) {
            setShowRejectInput(true);
            return;
        }
        if (decision === 'REJECT' && !rejectReason) {
            alert("Please enter a reason for rejection.");
            return;
        }

        if (!confirm(`Are you sure you want to ${decision} this user?`)) return;

        setLoading(true);
        const res = await processKyc(user.id, decision, rejectReason);
        if (res?.success) {
            router.refresh();
        } else {
            alert(res?.message || "Error processing KYC");
            setLoading(false);
        }
    };

    return (
        <div className={styles.kycContainer}>
            <div className={styles.kycHeader}>
                <h3 className={styles.kycTitle}>
                    <AlertTriangle size={18} /> KYC Action Required
                </h3>
            </div>

            <div className={styles.kycGrid}>
                <div>
                    <p className={styles.kycLabel}>Passport / ID Front</p>
                    <div className={styles.imgBox}>
                        <a href={user.passportUrl} target="_blank" rel="noreferrer">
                            <Image
                                src={user.passportUrl || '/placeholder.png'}
                                alt="Passport"
                                fill
                                style={{ objectFit: 'contain' }}
                            />
                        </a>
                    </div>
                </div>
                <div>
                    <p className={styles.kycLabel}>ID Card Back</p>
                    <div className={styles.imgBox}>
                        <a href={user.idCardUrl} target="_blank" rel="noreferrer">
                            <Image
                                src={user.idCardUrl || '/placeholder.png'}
                                alt="ID Card"
                                fill
                                style={{ objectFit: 'contain' }}
                            />
                        </a>
                    </div>
                </div>
            </div>

            {showRejectInput && (
                <input
                    className={styles.kycInput}
                    placeholder="Reason for rejection (e.g. Image blurry)"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    autoFocus
                />
            )}

            <div className={styles.kycActions}>
                <button
                    className={`${styles.btnApprove} ${loading ? styles.btnDisabled : ''}`}
                    onClick={() => handleAction('APPROVE')}
                    disabled={loading}
                >
                    <Check size={16} /> Approve Identity
                </button>
                <button
                    className={`${styles.btnReject} ${loading ? styles.btnDisabled : ''}`}
                    onClick={() => handleAction('REJECT')}
                    disabled={loading}
                >
                    <X size={16} /> Reject
                </button>
            </div>
        </div>
    );
}