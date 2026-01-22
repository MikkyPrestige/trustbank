'use client';

import { useState } from 'react';
import { processLoan } from '@/actions/admin/loan';
import styles from './loans.module.css';
import { Check, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function LoanDecisionButtons({ loanId }: { loanId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleDecision = async (decision: 'APPROVED' | 'REJECTED') => {
        if (!confirm(`Are you sure you want to ${decision} this loan?`)) return;

        setLoading(true);
        try {
            const res = await processLoan(loanId, decision);

            if (res.success) {
                toast.success(res.message);
                router.refresh(); // Refresh server components
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Failed to process request");
        }
        setLoading(false);
    };

    if (loading) return (
        <span className={styles.processing}>
            <Loader2 className={styles.spin} size={16} /> Processing...
        </span>
    );

    return (
        <div className={styles.btnGroup}>
            <button
                onClick={() => handleDecision('APPROVED')}
                className={styles.approveBtn}
                title="Approve Loan"
            >
                <Check size={16} /> Approve
            </button>
            <button
                onClick={() => handleDecision('REJECTED')}
                className={styles.rejectBtn}
                title="Reject Loan"
            >
                <X size={16} /> Reject
            </button>
        </div>
    );
}