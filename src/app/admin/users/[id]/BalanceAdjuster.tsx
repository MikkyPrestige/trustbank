'use client';

import { useState } from 'react';
import { adjustUserBalance } from "@/actions/admin-users";
import { PlusCircle, MinusCircle } from 'lucide-react';
import styles from '../users.module.css';

export default function BalanceAdjuster({ accountId }: { accountId: string }) {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAdjust = async (type: 'CREDIT' | 'DEBIT') => {
        if (!amount || isNaN(Number(amount))) return alert("Enter a valid amount");
        if (!confirm(`Are you sure you want to ${type} $${amount}?`)) return;

        setLoading(true);
        const res = await adjustUserBalance(accountId, Number(amount), type);
        setLoading(false);

        if (res?.success) {
            setAmount('');
            // Optional: Refresh page to see new balance
            window.location.reload();
        } else {
            alert("Failed");
        }
    };

    return (
        <div className={styles.adjuster}>
            <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={styles.miniInput}
            />
            <div className={styles.btnGroup}>
                <button onClick={() => handleAdjust('CREDIT')} disabled={loading} className={styles.fundBtn} title="Deposit">
                    <PlusCircle size={18} />
                </button>
                <button onClick={() => handleAdjust('DEBIT')} disabled={loading} className={styles.deductBtn} title="Withdraw">
                    <MinusCircle size={18} />
                </button>
            </div>
        </div>
    );
}