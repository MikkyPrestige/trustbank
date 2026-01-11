/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { approveKyc, rejectKyc } from '@/actions/admin-kyc';
import { Check, X, Eye, FileText } from 'lucide-react';
import styles from './verifications.module.css';

export default function VerificationRow({ user }: { user: any }) {
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleApprove = async () => {
        if (!confirm("Confirm identity verification?")) return;
        setLoading(true);
        await approveKyc(user.id);
        setLoading(false);
    };

    const handleReject = async () => {
        if (!confirm("Reject this application?")) return;
        setLoading(true);
        await rejectKyc(user.id);
        setLoading(false);
    };

    // Helper to get a valid image source
    const getImageSrc = (url: string | null, type: string) => {
        // If we have a valid http link, use it
        if (url && url.startsWith('http')) return url;

        // Otherwise, return a reliable placeholder generated from the user's name or type
        return `https://ui-avatars.com/api/?name=${type}&background=random&size=400`;
    };

    return (
        <>
            <tr className={styles.row}>
                <td>
                    <div className={styles.userName}>{user.fullName}</div>
                    <div className={styles.userEmail}>{user.email}</div>
                </td>
                <td>{new Date(user.updatedAt).toLocaleDateString()}</td>
                <td><span className={styles.badge}>Pending Review</span></td>
                <td>
                    <button onClick={() => setExpanded(!expanded)} className={styles.viewBtn}>
                        <Eye size={16} /> {expanded ? 'Hide Docs' : 'View Docs'}
                    </button>
                </td>
                <td>
                    <div className={styles.actions}>
                        <button onClick={handleApprove} disabled={loading} className={styles.approveBtn}>
                            <Check size={18} />
                        </button>
                        <button onClick={handleReject} disabled={loading} className={styles.rejectBtn}>
                            <X size={18} />
                        </button>
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
                                <h4><FileText size={14} /> Passport Photograph</h4>
                                <div className={styles.imgWrapper}>
                                    <img
                                        src={getImageSrc(user.passportUrl, "Passport")}
                                        alt="Passport"
                                        className={styles.docImg}
                                        onError={(e) => {
                                            e.currentTarget.src = "https://ui-avatars.com/api/?name=Error&background=red";
                                        }}
                                    />
                                </div>
                                <a href={user.passportUrl || '#'} target="_blank" className={styles.link}>Open Original</a>
                            </div>

                            {/* ID CARD */}
                            <div className={styles.docItem}>
                                <h4><FileText size={14} /> Government ID</h4>
                                <div className={styles.imgWrapper}>
                                    <img
                                        src={getImageSrc(user.idCardUrl, "ID+Card")}
                                        alt="ID Card"
                                        className={styles.docImg}
                                        onError={(e) => {
                                            e.currentTarget.src = "https://ui-avatars.com/api/?name=Error&background=red";
                                        }}
                                    />
                                </div>
                                <a href={user.idCardUrl || '#'} target="_blank" className={styles.link}>Open Original</a>
                            </div>

                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}