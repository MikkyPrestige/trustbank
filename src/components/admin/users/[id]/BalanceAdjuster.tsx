'use client';

import { useState } from 'react';
import { adjustUserBalance } from "@/actions/admin/fund";
import { PlusCircle, MinusCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './users.module.css';
import toast from 'react-hot-toast';

interface BalanceAdjusterProps {
    accountId: string;
    currency: string;
    rate: number;
}

export default function BalanceAdjuster({ accountId, currency, rate }: BalanceAdjusterProps) {
    const [amount, setAmount] = useState('');
    const [desc, setDesc] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleAdjust = async (type: 'CREDIT' | 'DEBIT') => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            return toast.error("Enter a valid amount");
        }

        // 1. Calculate USD Equivalent for Database
        const rawAmount = Number(amount);
        const usdAmount = rawAmount / rate;

        if (!confirm(`Are you sure you want to ${type} ${rawAmount} ${currency}?`)) return;

        setLoading(true);

        try {
            const res = await adjustUserBalance(
                accountId,
                usdAmount,
                type,
                desc,
                rawAmount,
                currency
            );

            if (res?.success) {
                setAmount('');
                setDesc('');
                toast.success(`Successfully ${type === 'CREDIT' ? 'added' : 'deducted'} ${rawAmount} ${currency}`);
                router.refresh();
            } else {
                toast.error(res?.message || "Transaction Failed");
            }
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.adjusterContainer}>
            <div className={styles.adjusterRow}>
                <div className={styles.inputWrapper}>
                    <span className={styles.currencyPrefix}>
                        {currency}
                    </span>
                    <input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className={styles.miniInput}
                        disabled={loading}
                    />
                </div>

                <div className={styles.btnGroup}>
                    <button
                        onClick={() => handleAdjust('CREDIT')}
                        disabled={loading}
                        className={styles.fundBtn}
                        title={`Credit ${currency}`}
                    >
                        {loading ? <Loader2 className={styles.spin} size={14} /> : <PlusCircle size={18} />}
                    </button>
                    <button
                        onClick={() => handleAdjust('DEBIT')}
                        disabled={loading}
                        className={styles.deductBtn}
                        title={`Debit ${currency}`}
                    >
                        {loading ? <Loader2 className={styles.spin} size={14} /> : <MinusCircle size={18} />}
                    </button>
                </div>
            </div>

            <input
                type="text"
                placeholder="Reason (Optional)"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className={styles.descInput}
                disabled={loading}
            />
        </div>
    );
}
