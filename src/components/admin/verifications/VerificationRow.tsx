/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { processKyc } from '@/actions/admin/kyc';
import { Check, X, Eye, FileText, Loader2, ChevronUp } from 'lucide-react';
import styles from './verifications.module.css';
import toast from 'react-hot-toast';
import { User } from '@prisma/client';

export default function VerificationRow({ user }: { user: User }) {
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const handleApprove = async () => {
        if (!confirm(`Verify identity for ${user.fullName}?`)) return;
        setLoading(true);
        try {
            const res = await processKyc(user.id, 'APPROVE');
            if (res.success) {
                toast.success(res.message);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Failed to approve");
        }
        setLoading(false);
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toast.error("Please provide a reason.");
            return;
        }
        setLoading(true);
        try {
            const res = await processKyc(user.id, 'REJECT', rejectReason);
            if (res.success) {
                toast.success(res.message);
                setShowRejectInput(false);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Failed to reject");
        }
        setLoading(false);
    };

    // Helper to get a valid image source or placeholder
    const getImageSrc = (url: string | null, type: string) => {
        if (url && url.startsWith('http')) return url;
        return `https://ui-avatars.com/api/?name=${type}&background=random&size=400`;
    };

    return (
        <>
            <tr className={`${styles.row} ${expanded ? styles.rowActive : ''}`}>
                <td className={styles.userCell}>
                    <div className={styles.userName}>{user.fullName}</div>
                    <div className={styles.userEmail}>{user.email}</div>
                </td>
                <td className={styles.dateCell}>{new Date(user.updatedAt).toLocaleDateString()}</td>
                <td><span className={styles.badge}>Pending Review</span></td>
                <td>
                    <button onClick={() => setExpanded(!expanded)} className={styles.viewBtn}>
                        {expanded ? <ChevronUp size={16} /> : <Eye size={16} />}
                        {expanded ? 'Hide Docs' : 'View Docs'}
                    </button>
                </td>
                <td>
                    <div className={styles.actions}>
                        {showRejectInput ? (
                            <div className={styles.rejectForm}>
                                <input
                                    className={styles.reasonInput}
                                    placeholder="Reason for rejection..."
                                    value={rejectReason}
                                    onChange={e => setRejectReason(e.target.value)}
                                    autoFocus
                                />
                                <button onClick={handleReject} disabled={loading} className={styles.confirmRejectBtn} title="Confirm Reject">
                                    {loading ? <Loader2 className={styles.spin} size={14} /> : <Check size={14} />}
                                </button>
                                <button onClick={() => setShowRejectInput(false)} className={styles.cancelBtn} title="Cancel">
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <button onClick={handleApprove} disabled={loading} className={styles.approveBtn} title="Approve">
                                    {loading ? <Loader2 className={styles.spin} size={18} /> : <Check size={18} />}
                                </button>
                                <button onClick={() => setShowRejectInput(true)} disabled={loading} className={styles.rejectBtn} title="Reject">
                                    <X size={18} />
                                </button>
                            </>
                        )}
                    </div>
                </td>
            </tr>

            {/* EXPANDED DOCUMENT VIEW */}
            {expanded && (
                <tr className={styles.expandedRow}>
                    <td colSpan={5}>
                        <div className={styles.docGrid}>
                            {/* PASSPORT */}
                            <div className={styles.docItem}>
                                <h4 className={styles.docTitle}><FileText size={14} /> Passport Photograph</h4>
                                <div className={styles.imgWrapper}>
                                    <img
                                        src={getImageSrc(user.passportUrl, "Passport")}
                                        alt="Passport"
                                        className={styles.docImg}
                                    />
                                </div>
                                <a href={user.passportUrl || '#'} target="_blank" rel="noreferrer" className={styles.link}>
                                    Open Full Resolution
                                </a>
                            </div>

                            {/* ID CARD */}
                            <div className={styles.docItem}>
                                <h4 className={styles.docTitle}><FileText size={14} /> Government ID</h4>
                                <div className={styles.imgWrapper}>
                                    <img
                                        src={getImageSrc(user.idCardUrl, "ID+Card")}
                                        alt="ID Card"
                                        className={styles.docImg}
                                    />
                                </div>
                                <a href={user.idCardUrl || '#'} target="_blank" rel="noreferrer" className={styles.link}>
                                    Open Full Resolution
                                </a>
                            </div>

                            {/* USER DETAILS (Summary) */}
                            <div className={styles.infoSummary}>
                                <h4>Submitted Data</h4>
                                <div className={styles.dataRow}>
                                    <span>Phone:</span> <strong>{user.phone || 'N/A'}</strong>
                                </div>
                                <div className={styles.dataRow}>
                                    <span>DOB:</span> <strong>{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'}</strong>
                                </div>
                                <div className={styles.dataRow}>
                                    <span>Address:</span> <strong>{user.address || 'N/A'}</strong>
                                </div>
                                <div className={styles.dataRow}>
                                    <span>City/State:</span> <strong>{user.city}, {user.state}</strong>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}