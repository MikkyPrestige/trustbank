'use client';

import { useState } from 'react';
import { processLoan } from '@/actions/admin/loan';
import styles from './loans.module.css';

export default function LoanDecisionButtons({ loanId }: { loanId: string }) {
    const [loading, setLoading] = useState(false);

    const handleDecision = async (decision: 'APPROVED' | 'REJECTED') => {
        if (!confirm(`Are you sure you want to ${decision} this loan?`)) return;

        setLoading(true);
        await processLoan(loanId, decision);
        setLoading(false);
    };

    if (loading) return <span className={styles.processing}>Processing...</span>;

    return (
        <div className={styles.btnGroup}>
            <button
                onClick={() => handleDecision('APPROVED')}
                className={styles.approveBtn}
            >
                Approve
            </button>
            <button
                onClick={() => handleDecision('REJECTED')}
                className={styles.rejectBtn}
            >
                Reject
            </button>
        </div>
    );
}