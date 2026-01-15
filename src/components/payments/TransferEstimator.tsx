'use client';

import { useState, useEffect } from 'react';
import styles from './TransferEstimator.module.css';
import { ArrowRightLeft, Clock, ShieldCheck, Globe } from 'lucide-react';

const RATES: Record<string, number> = {
    'EUR': 0.92,
    'GBP': 0.79,
    'NGN': 1600.50, // Updated to realistic market rate
    'CAD': 1.35
};

const FLAGS: Record<string, string> = {
    'EUR': '🇪🇺', 'GBP': '🇬🇧', 'NGN': '🇳🇬', 'CAD': '🇨🇦', 'USD': '🇺🇸'
};

export default function TransferEstimator() {
    const [amount, setAmount] = useState(1000);
    const [currency, setCurrency] = useState('EUR');
    const [converting, setConverting] = useState(false);

    // Simulate "Live Calculation" delay
    useEffect(() => {
        setConverting(true);
        const timer = setTimeout(() => setConverting(false), 400);
        return () => clearTimeout(timer);
    }, [amount, currency]);

    const convertedAmount = (amount * RATES[currency]).toLocaleString(undefined, { maximumFractionDigits: 2 });

    return (
        <div className={styles.estimatorCard}>
            <div className={styles.header}>
                <div className={styles.iconBox}><Globe size={28} /></div>
                <div>
                    <h3>Global Transfer Engine</h3>
                    <p>Send money internationally with zero hidden fees.</p>
                </div>
            </div>

            <div className={styles.converterBox}>
                {/* SEND ROW */}
                <div className={styles.row}>
                    <div className={styles.labelCol}>
                        <label>You Send</label>
                        <div className={styles.currencyBadge}>{FLAGS['USD']} USD</div>
                    </div>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className={styles.input}
                    />
                </div>

                {/* CONNECTOR LINE */}
                <div className={styles.connector}>
                    <div className={styles.line}></div>
                    <div className={styles.exchangeRate}>
                        <ArrowRightLeft size={14} /> 1 USD = {RATES[currency]} {currency}
                    </div>
                    <div className={styles.line}></div>
                </div>

                {/* RECEIVE ROW */}
                <div className={styles.row}>
                    <div className={styles.labelCol}>
                        <label>They Get</label>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className={styles.select}
                        >
                            {Object.keys(RATES).map(c => (
                                <option key={c} value={c}>{FLAGS[c]} {c}</option>
                            ))}
                        </select>
                    </div>
                    <div className={`${styles.displayAmount} ${converting ? styles.pulse : ''}`}>
                        {convertedAmount}
                    </div>
                </div>
            </div>

            {/* INFO GRID */}
            <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Transfer Fee</span>
                    <span className={styles.infoValueFree}>$0.00 (Free)</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Arrival</span>
                    <span className={styles.infoValue}><Clock size={14} /> Instantly</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Security</span>
                    <span className={styles.infoValue}><ShieldCheck size={14} /> End-to-End Encrypted</span>
                </div>
            </div>

            <button className={styles.sendBtn}>Initiate Transfer</button>
        </div>
    );
}