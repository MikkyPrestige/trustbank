'use client';

import { useState, useEffect } from 'react';
import styles from './TransferEstimator.module.css';
import { ArrowRightLeft, Clock, ShieldCheck, Globe } from 'lucide-react';

const RATES: Record<string, number> = { 'EUR': 0.92, 'GBP': 0.79, 'NGN': 1600.50, 'CAD': 1.35 };
const FLAGS: Record<string, string> = { 'EUR': '🇪🇺', 'GBP': '🇬🇧', 'NGN': '🇳🇬', 'CAD': '🇨🇦', 'USD': '🇺🇸' };

interface EstimatorProps {
    settings: any;
}

export default function TransferEstimator({ settings }: EstimatorProps) {
    const [amount, setAmount] = useState(1000);
    const [currency, setCurrency] = useState('EUR');
    const [converting, setConverting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setConverting(false), 400);
        return () => clearTimeout(timer);
    }, [amount, currency]);

    const convertedAmount = (amount * RATES[currency]).toLocaleString(undefined, { maximumFractionDigits: 2 });

    return (
        <div className={styles.estimatorCard}>
            <div className={styles.header}>
                <div className={styles.iconBox}><Globe size={28} /></div>
                <div>
                    <h3>{settings.payments_widget_title}</h3>
                    <p>{settings.payments_widget_desc}</p>
                </div>
            </div>

            <div className={styles.converterBox}>
                {/* SEND ROW */}
                <div className={styles.row}>
                    <div className={styles.labelCol}>
                        <label>{settings.payments_est_input_label}</label>
                        <div className={styles.currencyBadge}>{FLAGS['USD']} USD</div>
                    </div>
                    <input type="number" value={amount} onChange={(e) => { setConverting(true); setAmount(Number(e.target.value)); }} className={styles.input} />
                </div>

                {/* CONNECTOR LINE */}
                <div className={styles.connector}>
                    <div className={styles.line}></div>
                    <div className={styles.exchangeRate}><ArrowRightLeft size={14} /> 1 USD = {RATES[currency]} {currency}</div>
                    <div className={styles.line}></div>
                </div>

                {/* RECEIVE ROW */}
                <div className={styles.row}>
                    <div className={styles.labelCol}>
                        <label>{settings.payments_est_output_label}</label>
                        <select value={currency} onChange={(e) => { setConverting(true); setCurrency(e.target.value); }} className={styles.select}>
                            {Object.keys(RATES).map(c => <option key={c} value={c}>{FLAGS[c]} {c}</option>)}
                        </select>
                    </div>
                    <div className={`${styles.displayAmount} ${converting ? styles.pulse : ''}`}>{convertedAmount}</div>
                </div>
            </div>

            {/* INFO GRID */}
            <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>{settings.payments_widget_fee_label}</span>
                    <span className={styles.infoValueFree}>{settings.payments_widget_fee_value}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>{settings.payments_est_time_label}</span>
                    <span className={styles.infoValue}><Clock size={14} /> {settings.payments_est_time_val}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>{settings.payments_est_sec_label}</span>
                    <span className={styles.infoValue}><ShieldCheck size={14} /> {settings.payments_est_sec_val}</span>
                </div>
            </div>

            <button className={styles.sendBtn}>{settings.payments_est_btn}</button>
        </div>
    );
}