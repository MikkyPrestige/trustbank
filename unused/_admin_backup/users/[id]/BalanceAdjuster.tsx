'use client';

import { useState } from 'react';
import { adjustUserBalance } from "@/actions/admin/fund";
import { PlusCircle, MinusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from '../users.module.css';
import toast from 'react-hot-toast';

export default function BalanceAdjuster({ accountId }: { accountId: string }) {
    const [amount, setAmount] = useState('');
    const [desc, setDesc] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleAdjust = async (type: 'CREDIT' | 'DEBIT') => {
        if (!amount || isNaN(Number(amount))) {
            return toast.error("Enter a valid amount");
        }

        if (!confirm(`Are you sure you want to ${type} $${amount}?`)) return;

        setLoading(true);

        try {
            const res = await adjustUserBalance(accountId, Number(amount), type, desc);

            if (res?.success) {
                setAmount('');
                setDesc('');
                toast.success("Transaction Successful");
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
                <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={styles.miniInput}
                    disabled={loading}
                />

                <div className={styles.btnGroup}>
                    <button
                        onClick={() => handleAdjust('CREDIT')}
                        disabled={loading}
                        className={styles.fundBtn}
                        title="Credit Account"
                    >
                        <PlusCircle size={18} />
                    </button>
                    <button
                        onClick={() => handleAdjust('DEBIT')}
                        disabled={loading}
                        className={styles.deductBtn}
                        title="Debit Account"
                    >
                        <MinusCircle size={18} />
                    </button>
                </div>
            </div>

            <input
                type="text"
                placeholder="Description (Optional)"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className={styles.descInput}
                disabled={loading}
            />
        </div>
    );
}