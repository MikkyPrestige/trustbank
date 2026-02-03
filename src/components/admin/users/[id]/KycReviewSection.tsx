'use client';

import { useState } from 'react';
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { processKyc } from '@/actions/admin/kyc';
import { Check, X, AlertTriangle, User, FileText, ShieldCheck, Ban, ExternalLink } from 'lucide-react';
import styles from './users.module.css';

export default function KycReviewSection({ user }: { user: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectInput, setShowRejectInput] = useState(false);

    const isPending = user.kycStatus === 'PENDING';
    const isVerified = user.kycStatus === 'VERIFIED';
    const isFailed = user.kycStatus === 'FAILED';
    const isNotSubmitted = user.kycStatus === 'NOT_SUBMITTED';

    if (isNotSubmitted) return null;

    // HELPER: Render Image or PDF Button
    const renderPreview = (url: string | null, alt: string) => {
        if (!url) return <div className={styles.placeholderBox}>No Document</div>;
        // Check for PDF
        if (url.toLowerCase().includes('.pdf')) {
            return (
                <div className={styles.pdfPreview}>
                    <FileText size={48} className={styles.pdfIcon} />
                    <span className={styles.pdfLabel}>Document</span>
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.viewPdfBtn}
                    >
                        Open PDF <ExternalLink size={12} />
                    </a>
                </div>
            );
        }

        return (
            <a href={url} target="_blank" rel="noreferrer" className={styles.imageLink}>
                <Image src={url} alt={alt} fill sizes="(max-width: 768px) 100vw, 33vw" className={styles.docImage} />
            </a>
        );
    };

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
                    {isPending && <><AlertTriangle size={20} />KYC Review</>}
                    {isVerified && <><ShieldCheck size={20} className="textGreen" /> KYC Documents</>}
                    {isFailed && <><Ban size={20} className="textRed" /> Rejected Documents</>}
                </h3>

                <span className={`${styles.kycBadge} ${styles[user.kycStatus]}`}>
                    {user.kycStatus}
                </span>
            </div>

            <div className={styles.kycGrid}>

                {/* 1. PASSPORT (Always Image) */}
                <div className={styles.kycCard}>
                    <p className={styles.kycLabel}>Passport</p>
                    <div className={styles.imgBox}>
                        {user.passportUrl || user.image ? (
                            <a href={user.passportUrl || user.image} target="_blank" rel="noreferrer" className={styles.imageLink}>
                                <Image
                                    src={user.passportUrl || user.image}
                                    alt="Passport"
                                    fill
                                    className={styles.docImage}
                                />
                            </a>
                        ) : (
                            <User size={32} className={styles.placeholderIcon} />
                        )}
                    </div>
                </div>

                {/* 2. ID FRONT (Image OR PDF) */}
                <div className={styles.kycCard}>
                    <p className={styles.kycLabel}>ID Front</p>
                    <div className={styles.imgBox}>
                        {renderPreview(user.idCardUrl, "ID Front")}
                    </div>
                </div>

                {/* 3. ID BACK (Image OR PDF) */}
                <div className={styles.kycCard}>
                    <p className={styles.kycLabel}>ID Back</p>
                    <div className={styles.imgBox}>
                        {renderPreview(user.idCardBackUrl, "ID Back")}
                    </div>
                </div>
            </div>

            {/* ACTIONS */}
            {isPending && (
                <>
                    {showRejectInput && (
                        <input
                            className={styles.kycInput}
                            placeholder="Reason for rejection..."
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
                            <Check size={18} /> Approve
                        </button>
                        <button
                            className={`${styles.btnReject} ${loading ? styles.btnDisabled : ''}`}
                            onClick={() => handleAction('REJECT')}
                            disabled={loading}
                        >
                            <X size={18} /> Reject
                        </button>
                    </div>
                </>
            )}

            {isFailed && user.kycRejectionReason && (
                <div className={styles.kycInput} style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' }}>
                    <strong>Rejection Reason:</strong> {user.kycRejectionReason}
                </div>
            )}
        </div>
    );
}