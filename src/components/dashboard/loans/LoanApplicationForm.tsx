'use client';

import { useActionState, useState } from 'react';
import { applyForLoan } from '@/actions/user/loan';
import styles from './loans.module.css';
import { Loader2 } from 'lucide-react';

export default function LoanApplicationForm() {
    const [state, action, isPending] = useActionState(applyForLoan, undefined);

    const [amount, setAmount] = useState(5000);
    const [months, setMonths] = useState(12);

    const interestRate = 0.05; // 5%
    const totalRepayment = amount + (amount * interestRate);
    const monthlyPayment = totalRepayment / months;

    return (
        <form action={action} className={styles.form}>
            {state?.message && (
                <div className={state.success ? styles.success : styles.error}>
                    {state.message}
                </div>
            )}

            {/* AMOUNT SLIDER */}
            <div className={styles.group}>
                <label className={styles.label}>I want to borrow</label>
                <div className={styles.amountInputWrapper}>
                    <span className={styles.currencySymbol}>$</span>
                    <input
                        name="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className={styles.amountInput}
                        min={1000}
                        max={50000}
                    />
                </div>
                <input
                    type="range" min="1000" max="50000" step="1000"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className={styles.range}
                />
            </div>

            <div className={styles.flexRow}>
                {/* TERM SELECT */}
                <div className={`${styles.group} ${styles.flexItem}`}>
                    <label className={styles.label}>Duration</label>
                    <select
                        name="months"
                        value={months}
                        onChange={(e) => setMonths(Number(e.target.value))}
                        className={styles.select}
                    >
                        <option value="6">6 Months</option>
                        <option value="12">12 Months</option>
                        <option value="24">24 Months</option>
                        <option value="36">36 Months</option>
                    </select>
                </div>

                {/* REASON SELECT */}
                <div className={`${styles.group} ${styles.flexItem}`}>
                    <label className={styles.label}>Purpose</label>
                    <select name="reason" className={styles.select}>
                        <option value="Business">Business</option>
                        <option value="Home">Home</option>
                        <option value="Vehicle">Car</option>
                        <option value="Investment">Investment</option>
                        <option value="Personal">Personal</option>
                    </select>
                </div>
            </div>

            {/* LIVE CALCULATOR PREVIEW */}
            <div className={styles.calculatorBox}>
                <div className={styles.calcRow}>
                    <span>Interest Rate</span>
                    <span>5.0% Fixed</span>
                </div>
                <div className={styles.calcRow}>
                    <span>Monthly Payment</span>
                    <span className={styles.highlight}>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(monthlyPayment)}
                    </span>
                </div>
                <div className={styles.calcRow}>
                    <span>Total Repayment</span>
                    <span>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalRepayment)}
                    </span>
                </div>
            </div>

            {/* PIN INPUT */}
            <div className={styles.group}>
                <label className={styles.label}>Security PIN</label>
                <input
                    name="pin"
                    type="password"
                    required
                    placeholder="••••"
                    maxLength={4}
                    className={styles.pinInput}
                />
            </div>

            <button disabled={isPending} className={styles.button}>
                {isPending ? <><Loader2 className={styles.spin} size={20} /> Processing...</> : 'Submit Application'}
            </button>
        </form>
    );
}