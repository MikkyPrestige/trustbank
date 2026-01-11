'use client';

import { useState } from 'react';
import { processLoan } from '@/actions/admin-loan';

export default function LoanDecisionButtons({ loanId }: { loanId: string }) {
    const [loading, setLoading] = useState(false);

    const handleDecision = async (decision: 'APPROVED' | 'REJECTED') => {
        if (!confirm(`Are you sure you want to ${decision} this loan?`)) return;

        setLoading(true);
        await processLoan(loanId, decision);
        setLoading(false);
    };

    if (loading) return <span style={{ color: '#888', fontSize: '0.8rem', fontStyle: 'italic' }}>Processing...</span>;

    return (
        <div style={{ display: 'flex', gap: '8px' }}>
            <button
                onClick={() => handleDecision('APPROVED')}
                style={{
                    background: '#059669', color: 'white', border: 'none',
                    padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem'
                }}
            >
                Approve
            </button>
            <button
                onClick={() => handleDecision('REJECTED')}
                style={{
                    background: 'transparent', color: '#ef4444', border: '1px solid #ef4444',
                    padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem'
                }}
            >
                Reject
            </button>
        </div>
    );
}