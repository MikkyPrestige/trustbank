'use client';

import Link from 'next/link';
import { AlertTriangle, Clock, XCircle, ShieldCheck } from 'lucide-react';
import styles from './styles/kycBanner.module.css';

interface Props {
    kycStatus: string;
    kycRejectionReason?: string | null;
}

export default function KycVerificationBanner({ kycStatus, kycRejectionReason }: Props) {
    if (kycStatus === 'VERIFIED') return null;

    if (kycStatus === 'PENDING') {
        return (
            <div className={`${styles.banner} ${styles.pending}`}>
                <Clock size={18} className={styles.icon} />
                <div className={styles.content}>
                    <strong>Identity Verification Pending</strong>
                    <span>Your documents are under review. We&apos;ll notify you once verified — this usually takes 1–2 business days.</span>
                </div>
            </div>
        );
    }

    if (kycStatus === 'FAILED') {
        return (
            <div className={`${styles.banner} ${styles.failed}`}>
                <XCircle size={18} className={styles.icon} />
                <div className={styles.content}>
                    <strong>Verification Failed</strong>
                    {kycRejectionReason && <span className={styles.reason}>{kycRejectionReason}</span>}
                    <span>Please re-submit your documents to restore full account access.</span>
                </div>
                <Link href="/dashboard/verify" className={`${styles.cta} ${styles.ctaDanger}`}>
                    Re-upload
                </Link>
            </div>
        );
    }

    // NOT_SUBMITTED (default)
    return (
        <div className={`${styles.banner} ${styles.warning}`}>
            <AlertTriangle size={18} className={styles.icon} />
            <div className={styles.content}>
                <strong>Verify Your Identity</strong>
                <span>Complete KYC verification to unlock transfers, wire payments, and all account features.</span>
            </div>
            <Link href="/dashboard/verify" className={`${styles.cta} ${styles.ctaWarning}`}>
                Verify Now
            </Link>
        </div>
    );
}
