'use client';

import { useState, useMemo } from 'react';
import styles from './LoanCalculator.module.css';
import { DollarSign, Calendar, Percent } from 'lucide-react';

// 1. Accept Props
interface LoanCalculatorProps {
    defaultRate?: number;
}

export default function LoanCalculator({ defaultRate = 6.99 }: LoanCalculatorProps) {
    const [amount, setAmount] = useState(25000);
    const [months, setMonths] = useState(36);

    // 2. Use prop as initial state
    const [rate, setRate] = useState(defaultRate);

    const monthlyPayment = useMemo(() => {
        const principal = amount;
        const calculatedInterest = rate / 100 / 12;
        const calculatedPayments = months;

        const x = Math.pow(1 + calculatedInterest, calculatedPayments);
        const monthly = (principal * x * calculatedInterest) / (x - 1);

        return isFinite(monthly) ? monthly : 0;
    }, [amount, months, rate]);

    const getBackgroundSize = (val: number, min: number, max: number) => {
        return { backgroundSize: `${((val - min) * 100) / (max - min)}% 100%` };
    };

    return (
        <div className={styles.calculatorCard}>
            <div className={styles.header}>
                <h3>Estimate Your Payment</h3>
                <p>See how affordable your dream project can be.</p>
            </div>

            <div className={styles.calcGrid}>
                {/* CONTROLS */}
                <div className={styles.controls}>

                    {/* AMOUNT SLIDER */}
                    <div className={styles.inputGroup}>
                        <div className={styles.labelRow}>
                            <label><DollarSign size={16} /> Loan Amount</label>
                            <span className={styles.valueDisplay}>${amount.toLocaleString()}</span>
                        </div>
                        <input
                            type="range" min="1000" max="100000" step="1000"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className={styles.rangeInput}
                            style={getBackgroundSize(amount, 1000, 100000)}
                        />
                    </div>

                    {/* MONTHS SLIDER */}
                    <div className={styles.inputGroup}>
                        <div className={styles.labelRow}>
                            <label><Calendar size={16} /> Term (Months)</label>
                            <span className={styles.valueDisplay}>{months} Months</span>
                        </div>
                        <input
                            type="range" min="12" max="84" step="12"
                            value={months}
                            onChange={(e) => setMonths(Number(e.target.value))}
                            className={styles.rangeInput}
                            style={getBackgroundSize(months, 12, 84)}
                        />
                        <div className={styles.termBadges}>
                            {[12, 36, 60, 84].map(m => (
                                <button key={m} onClick={() => setMonths(m)} className={months === m ? styles.activeBadge : ''}>
                                    {m}mo
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* INTEREST RATE */}
                    <div className={styles.inputGroup}>
                        <div className={styles.labelRow}>
                            <label><Percent size={16} /> Interest Rate (APR)</label>
                            <span className={styles.valueDisplay}>{rate}%</span>
                        </div>
                        <input
                            type="range" min="3.0" max="25.0" step="0.1"
                            value={rate}
                            onChange={(e) => setRate(Number(e.target.value))}
                            className={styles.rangeInput}
                            style={getBackgroundSize(rate, 3.0, 25.0)}
                        />
                    </div>
                </div>

                {/* RESULT BOX */}
                <div className={styles.resultBox}>
                    <span className={styles.resultLabel}>Estimated Monthly Payment</span>
                    <div className={styles.resultAmount}>
                        ${monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>

                    <div className={styles.breakdown}>
                        <div className={styles.breakdownItem}>
                            <span>Total Principal</span>
                            <strong>${amount.toLocaleString()}</strong>
                        </div>
                        <div className={styles.breakdownItem}>
                            <span>Total Interest</span>
                            <strong>${((monthlyPayment * months) - amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
                        </div>
                        <div className={styles.breakdownTotal}>
                            <span>Total Cost</span>
                            <strong>${(monthlyPayment * months).toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
                        </div>
                    </div>

                    <button className={styles.applyBtn}>Apply for this Loan</button>
                </div>
            </div>
        </div>
    );
}