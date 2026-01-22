'use client';

import { useActionState, useState, useEffect } from 'react';
import { payBill } from '@/actions/user/bills';
import { Zap, Wifi, Tv, Smartphone, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './bills.module.css';

const PROVIDERS = [
    { id: 'Electric', name: 'Electricity', icon: Zap, color: '#eab308' },
    { id: 'Internet', name: 'Internet / WiFi', icon: Wifi, color: '#3b82f6' },
    { id: 'Cable', name: 'Cable TV', icon: Tv, color: '#ef4444' },
    { id: 'Phone', name: 'Airtime', icon: Smartphone, color: '#22c55e' },
];

export default function BillsPage() {
    const [selected, setSelected] = useState(PROVIDERS[0]);
    const [state, action, isPending] = useActionState(payBill, undefined);

    // Watch for server response
    useEffect(() => {
        if (state?.message) {
            if (state.success) {
                toast.success(state.message);
                // Optional: Clear form here if needed
            } else {
                toast.error(state.message);
            }
        }
    }, [state]);

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
                            background: selected.id === p.id ? `${p.color}15` : 'rgba(255,255,255,0.03)'
                        }}>
                            <p.icon size={28} />
                        </div>
                        <span className={styles.providerName}>{p.name}</span>
                        {selected.id === p.id && <div className={styles.indicator} style={{ background: p.color }} />}
                    </div>
                ))}
            </div>

            {/* Payment Form */}
            <form action={action} className={styles.formCard}>
                {/* Hidden input to pass the selected provider name to server */}
                <input type="hidden" name="provider" value={selected.name} />

                <h3 className={styles.formTitle}>Pay {selected.name}</h3>
                <p className={styles.formSubtitle}>Enter your billing details below to proceed.</p>

                <div className={styles.group}>
                    <label className={styles.label}>Account / Meter Number</label>
                    {/* Added name="accountNumber" so the backend gets the value */}
                    <input
                        name="accountNumber"
                        required
                        placeholder="e.g. 1029384756"
                        className={styles.input}
                    />
                </div>

                <div className={styles.row}>
                    <div className={styles.group} style={{ flex: 2 }}>
                        <label className={styles.label}>Amount (USD)</label>
                        <input
                            name="amount"
                            type="number"
                            step="0.01"
                            required
                            placeholder="0.00"
                            className={`${styles.input} ${styles.inputAmount}`}
                        />
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