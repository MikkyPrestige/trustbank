'use client';

import { useState, useActionState } from 'react';
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

export default function RepaymentModal({ loan, maxPayable }: { loan: Loan, maxPayable: number }) {
    const [isOpen, setIsOpen] = useState(false);

    const [amountStr, setAmountStr] = useState<string>(
        Math.min(loan.monthlyPayment, maxPayable).toString()
    );

    const [state, action, isPending] = useActionState(repayLoan, undefined);

    const remainingBalance = loan.totalRepayment - loan.repaidAmount;

    const handleAmountChange = (val: string) => {
        if (val === '') {
            setAmountStr('');
            return;
        }

        if (val.length > 1 && val.startsWith('0')) {
            val = val.replace(/^0+/, '');
        }

        const numVal = Number(val);
        if (numVal > remainingBalance) {
            setAmountStr(remainingBalance.toString());
        } else {
            setAmountStr(val);
        }
    };

    if (!isOpen) {
        return (
            <button onClick={() => setIsOpen(true)} className={styles.repayBtn}>
                <DollarSign size={14} /> Pay Now
            </button>
        );
    }

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h3>Repay Loan</h3>
                    <button onClick={() => setIsOpen(false)} className={styles.closeBtn}><X size={18} /></button>
                </div>

                <div className={styles.balanceInfo}>
                    <span>Remaining Balance</span>
                    <strong className={styles.balanceAmount}>${remainingBalance.toFixed(2)}</strong>
                </div>

                <form action={action}>
                    <input type="hidden" name="loanId" value={loan.id} />

                    {state?.message && (
                        <div className={state.success ? styles.successMsg : styles.errorMsg}>
                            {state.message}
                        </div>
                    )}

                    <div className={styles.group}>
                        <label className={styles.label}>Payment Amount</label>
                        <div className={styles.amountInputWrapper}>
                            <span className={`${styles.currencySymbol} ${styles.currencySymbolGreen}`}>$</span>

                            <input
                                name="amount"
                                type="number"
                                value={amountStr}
                                placeholder="0"
                                onChange={(e) => handleAmountChange(e.target.value)}
                                className={styles.amountInput}
                            />
                        </div>
                    </div>

                    <input
                        type="range"
                        min="1"
                        max={remainingBalance}
                        value={Number(amountStr) || 0}
                        onChange={(e) => setAmountStr(e.target.value)}
                        className={styles.slider}
                    />

                    <div className={styles.limits}>
                        <span onClick={() => setAmountStr(loan.monthlyPayment.toString())} className={styles.limitBtn}>
                            Min: ${loan.monthlyPayment.toFixed(0)}
                        </span>
                        <span onClick={() => setAmountStr(remainingBalance.toString())} className={styles.limitBtn}>
                            Max: ${remainingBalance.toFixed(0)}
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
        </div>
    );
}