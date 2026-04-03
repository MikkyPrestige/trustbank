'use client';

import { useState, useMemo } from 'react';
import styles from './LoanCalculator.module.css';
import { DollarSign, Calendar, Percent } from 'lucide-react';

interface LoanCalculatorProps {
    defaultRate?: number;
    settings: any;
}

export default function LoanCalculator({ defaultRate = 6.99, settings }: LoanCalculatorProps) {
    const minAmt = settings.borrow_calc_min_amt || 1000;
    const maxAmt = settings.borrow_calc_max_amt || 100000;
    const minTerm = settings.borrow_calc_min_term || 12;
    const maxTerm = settings.borrow_calc_max_term || 84;
    const symbol = settings.borrow_calc_currency || '$';
    const pc = settings.borrow_calc_percent || '%';

    const [amount, setAmount] = useState(maxAmt / 4);
    const [months, setMonths] = useState(36);
    const [rate, setRate] = useState(defaultRate);

    const monthlyPayment = useMemo(() => {
        const principal = amount;
        const calculatedInterest = rate / 100 / 12;
        const x = Math.pow(1 + calculatedInterest, months);
        const monthly = (principal * x * calculatedInterest) / (x - 1);
        return isFinite(monthly) ? monthly : 0;
    }, [amount, months, rate]);

    const getBackgroundSize = (val: number, min: number, max: number) => {
        return { backgroundSize: `${((val - min) * 100) / (max - min)}% 100%` };
    };

    return (
        <div className={styles.calculatorCard}>
            <div className={styles.header}>
                <h3>{settings.borrow_calc_title}</h3>
                <p>{settings.borrow_calc_desc}</p>
            </div>

            <div className={styles.calcGrid}>
                <div className={styles.controls}>
                    <div className={styles.inputGroup}>
                        <div className={styles.labelRow}>
                            <label><DollarSign size={16} />{settings.borrow_calc_label_amt}</label>
                            <span className={styles.valueDisplay}>{symbol}{amount.toLocaleString()}</span>
                        </div>
                        <input
                            type="range" min={minAmt} max={maxAmt} step="1000"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className={styles.rangeInput}
                            style={getBackgroundSize(amount, minAmt, maxAmt)}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <div className={styles.labelRow}>
                            <label><Calendar size={16} />{settings.borrow_calc_label_term}</label>
                            <span className={styles.valueDisplay}>{months} {settings.borrow_calc_unit_mo}</span>
                        </div>
                        <input
                            type="range" min={minTerm} max={maxTerm} step="12"
                            value={months}
                            onChange={(e) => setMonths(Number(e.target.value))}
                            className={styles.rangeInput}
                            style={getBackgroundSize(months, minTerm, maxTerm)}
                        />
                        <div className={styles.termBadges}>
                            {[12, 36, 60, 84].map(m => (
                                <button key={m} onClick={() => setMonths(m)} className={months === m ? styles.activeBadge : ''}>
                                    {m}mo
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <div className={styles.labelRow}>
                            <label><Percent size={16} /> {settings.borrow_calc_label_rate}</label>
                            <span className={styles.valueDisplay}>{rate}{pc}</span>
                        </div>
                        <input
                            type="range" min="1.0" max="30.0" step="0.1"
                            value={rate}
                            onChange={(e) => setRate(Number(e.target.value))}
                            className={styles.rangeInput}
                            style={getBackgroundSize(rate, 1.0, 30.0)}
                        />
                    </div>
                </div>

                <div className={styles.resultBox}>
                    <span className={styles.resultLabel}>{settings.borrow_calc_res_monthly}</span>
                    <div className={styles.resultAmount}>
                        {symbol}{monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>

                    <div className={styles.breakdown}>
                        <div className={styles.breakdownItem}>
                            <span>{settings.borrow_calc_label_princ}</span>
                            <strong>{symbol}{amount.toLocaleString()}</strong>
                        </div>
                        <div className={styles.breakdownItem}>
                            <span>{settings.borrow_calc_label_int}</span>
                            <strong>{symbol}{((monthlyPayment * months) - amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
                        </div>
                        <div className={styles.breakdownTotal}>
                            <span>{settings.borrow_calc_res_total}</span>
                            <strong>{symbol}{(monthlyPayment * months).toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
                        </div>
                    </div>
                    <button className={styles.applyBtn}>{settings.borrow_calc_cta}</button>
                </div>
            </div>
        </div>
    );
}