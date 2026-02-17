'use client';

import { useActionState, useState, useEffect } from 'react';
import { payBill } from '@/actions/user/bills';
import { Zap, Wifi, Tv, Smartphone, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './bills.module.css';

const PROVIDERS = [
    { id: 'Electric', name: 'Electricity', icon: Zap, color: 'var(--accent)' },
    { id: 'Internet', name: 'Internet / WiFi', icon: Wifi, color: 'var(--primary)' },
    { id: 'Cable', name: 'Cable TV', icon: Tv, color: 'var(--danger)' },
    { id: 'Phone', name: 'Airtime', icon: Smartphone, color: 'var(--success)' },
];

export default function BillsClient({ currency, rate }: { currency: string, rate: number }) {
    const [selected, setSelected] = useState(PROVIDERS[0]);
    const [state, action, isPending] = useActionState(payBill, undefined);

    useEffect(() => {
        if (state?.message) {
            if (state.success) {
                toast.success(state.message);
            } else {
                toast.error(state.message);
            }
        }
    }, [state]);

    const handleFormSubmit = (formData: FormData) => {
        const inputAmount = Number(formData.get("amount")); // Native Currency

        // 1. Convert to USD
        const usdAmount = inputAmount / rate;
        formData.set("amount", usdAmount.toString());

        // 2. Add Display Data
        formData.set("displayAmount", inputAmount.toString());
        formData.set("displayCurrency", currency);

        action(formData);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Utility Payments</h1>
                <p className={styles.subtitle}>Select a service provider to settle bills instantly.</p>
            </div>

            {/* Provider Selection Grid */}
            <div className={styles.grid}>
                {PROVIDERS.map(p => (
                    <div
                        key={p.id}
                        onClick={() => setSelected(p)}
                        className={`${styles.card} ${selected.id === p.id ? styles.cardSelected : ''}`}
                    >
                        <div className={styles.iconBox} style={{
                            color: p.color,
                            background: selected.id === p.id ? `${p.color}15` : 'var(--bg-surface)'
                        }}>
                            <p.icon size={28} />
                        </div>
                        <span className={styles.providerName}>{p.name}</span>
                        {selected.id === p.id && <div className={styles.indicator} style={{ background: p.color }} />}
                    </div>
                ))}
            </div>

            {/* Payment Form */}
            <form action={handleFormSubmit} className={styles.formCard}>
                <input type="hidden" name="provider" value={selected.name} />

                <h3 className={styles.formTitle}>Pay {selected.name}</h3>
                <p className={styles.formSubtitle}>Enter your billing details below to proceed.</p>

                <div className={styles.group}>
                    <label className={styles.label}>Account / Meter Number</label>
                    <input
                        name="accountNumber"
                        required
                        placeholder="e.g. 1029384756"
                        className={styles.input}
                    />
                </div>

                <div className={styles.row}>
                    <div className={styles.group} style={{ flex: 2 }}>
                        <label className={styles.label}>Amount ({currency})</label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.currencySymbol}>{currency}</span>
                            <input
                                name="amount"
                                type="number"
                                step="0.01"
                                required
                                placeholder="0.00"
                                className={`${styles.input} ${styles.inputAmount}`}
                                style={{ paddingLeft: '3.5rem' }}
                            />
                        </div>
                    </div>

                    <div className={styles.group} style={{ flex: 1 }}>
                        <label className={styles.label}>Security PIN</label>
                        <input
                            name="pin"
                            type="password"
                            maxLength={4}
                            required
                            placeholder="••••"
                            className={`${styles.input} ${styles.inputPin}`}
                        />
                    </div>
                </div>

                <button disabled={isPending} className={styles.payBtn}>
                    {isPending ? (
                        <><Loader2 className={styles.spin} size={18} /> Processing Payment...</>
                    ) : (
                        `Pay ${selected.name} Bill`
                    )}
                </button>
            </form>
        </div>
    );
}