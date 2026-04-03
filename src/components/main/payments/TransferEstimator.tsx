'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './TransferEstimator.module.css';
import { ArrowRightLeft, Clock, ShieldCheck, Globe } from 'lucide-react';

interface CurrencyItem {
    code: string;
    flag: string;
    rate: number;
}

interface EstimatorProps {
    settings: any;
    currencies: CurrencyItem[];
}

export default function TransferEstimator({ settings, currencies = [] }: EstimatorProps) {
    const [amount, setAmount] = useState('1000');
    const [selectedCode, setSelectedCode] = useState(currencies[0]?.code || 'EUR');
    const [converting, setConverting] = useState(false);

    const currentCurrency = currencies.find(c => c.code === selectedCode) || { rate: 1, flag: '🌐' };

    const numericAmount = parseFloat(amount) || 0;

    useEffect(() => {
        const timer = setTimeout(() => setConverting(false), 400);
        return () => clearTimeout(timer);
    }, [amount, selectedCode]);

    const convertedAmount = (numericAmount * currentCurrency.rate).toLocaleString(undefined, {
        maximumFractionDigits: 2
    });

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
                <div className={styles.row}>
                    <div className={styles.labelCol}>
                        <label>{settings.payments_est_input_label}</label>
                        <div className={styles.currencyBadge}>🇺🇸 USD</div>
                    </div>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => { setConverting(true); setAmount(e.target.value); }}
                        onBlur={() => {
                            if (amount === '') setAmount('0');
                        }}
                        className={styles.input}
                    />
                </div>

                <div className={styles.connector}>
                    <div className={styles.line}></div>
                    <div className={styles.exchangeRate}>
                        <ArrowRightLeft size={14} /> 1 USD = {currentCurrency.rate} {selectedCode}
                    </div>
                    <div className={styles.line}></div>
                </div>

                <div className={styles.row}>
                    <div className={styles.labelCol}>
                        <label>{settings.payments_est_output_label}</label>
                        <select
                            value={selectedCode}
                            onChange={(e) => { setConverting(true); setSelectedCode(e.target.value); }}
                            className={styles.select}
                        >
                            {currencies.map(c => (
                                <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                            ))}
                        </select>
                    </div>
                    <div className={`${styles.displayAmount} ${converting ? styles.pulse : ''}`}>
                        {convertedAmount}
                    </div>
                </div>
            </div>

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

            <Link href={settings.payments_est_link || '/dashboard'} className={styles.sendBtn}>
                {settings.payments_est_btn}
            </Link>
        </div>
    );
}