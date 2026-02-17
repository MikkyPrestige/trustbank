'use client';

import { useState, useActionState } from 'react';
import { createPortal } from 'react-dom';
import { repayLoan } from '@/actions/user/loan';
import styles from './loans.module.css';
import { DollarSign, X, Loader2 } from 'lucide-react';

interface Loan {
    id: string;
    amount: number;
    monthlyPayment: number;
    totalRepayment: number;
    repaidAmount: number;
}

export default function RepaymentModal({
    loan,
    maxPayable,
    currency,
    rate
}: {
    loan: Loan,
    maxPayable: number,
    currency: string,
    rate: number
}) {
    const [isOpen, setIsOpen] = useState(false);

    // Convert values to Native
    const remainingUSD = loan.totalRepayment - loan.repaidAmount;
    const remainingNative = remainingUSD * rate;

    // Note: maxPayable is the account balance (USD).
    const maxPayableNative = maxPayable * rate;
    const monthlyPaymentNative = loan.monthlyPayment * rate;

    // Default amount: Monthly payment, capped by balance or remaining debt
    const defaultAmount = Math.min(monthlyPaymentNative, maxPayableNative, remainingNative);

    const [amountStr, setAmountStr] = useState<string>(defaultAmount.toFixed(2));

    const [state, action, isPending] = useActionState(repayLoan, undefined);

    const handleAmountChange = (val: string) => {
        if (val === '') {
            setAmountStr('');
            return;
        }
        // Basic validation
        const numVal = Number(val);
        if (numVal > remainingNative) {
            setAmountStr(remainingNative.toFixed(2));
        } else {
            setAmountStr(val);
        }
    };

    const handleFormSubmit = (formData: FormData) => {
        const inputAmount = Number(formData.get("amount"));

        // Convert to USD
        const usdAmount = inputAmount / rate;
        formData.set("amount", usdAmount.toString());

        // Add display info
        formData.set("displayAmount", inputAmount.toString());
        formData.set("displayCurrency", currency);

        action(formData);
    }

    return (
        <>
            <button onClick={() => setIsOpen(true)} className={styles.repayBtn}>
                <DollarSign size={14} /> Pay Now
            </button>

            {isOpen && createPortal(
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3>Repay Loan</h3>
                            <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className={styles.balanceInfo}>
                            <span>Remaining Balance</span>
                            <strong className={styles.balanceAmount}>
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(remainingNative)}
                            </strong>
                        </div>

                        <form action={handleFormSubmit}>
                            <input type="hidden" name="loanId" value={loan.id} />

                            {state?.message && (
                                <div className={state.success ? styles.successMsg : styles.errorMsg}>
                                    {state.message}
                                </div>
                            )}

                            <div className={styles.group}>
                                <label className={styles.label}>Payment Amount</label>
                                <div className={styles.amountInputWrapper}>
                                    <span className={`${styles.currencySymbol} ${styles.currencySymbolGreen}`}>
                                        {currency}
                                    </span>
                                    <input
                                        name="amount"
                                        type="number"
                                        value={amountStr}
                                        placeholder="0.00"
                                        onChange={(e) => handleAmountChange(e.target.value)}
                                        className={styles.amountInput}
                                        step="0.01"
                                    />
                                </div>
                            </div>

                            <input
                                type="range"
                                min="1"
                                max={Math.ceil(remainingNative)}
                                value={Number(amountStr) || 0}
                                onChange={(e) => setAmountStr(e.target.value)}
                                className={styles.slider}
                            />

                            <div className={styles.limits}>
                                <span onClick={() => setAmountStr(monthlyPaymentNative.toFixed(2))} className={styles.limitBtn}>
                                    Min: {Math.floor(monthlyPaymentNative)}
                                </span>
                                <span onClick={() => setAmountStr(remainingNative.toFixed(2))} className={styles.limitBtn}>
                                    Max: {Math.floor(remainingNative)}
                                </span>
                            </div>

                            <button
                                disabled={isPending || !amountStr || Number(amountStr) <= 0}
                                className={styles.payConfirmBtn}
                            >
                                {isPending ? <Loader2 className={styles.spin} size={20} /> : 'Confirm Payment'}
                            </button>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}