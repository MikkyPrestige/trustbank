'use client';

import { useActionState, useEffect } from 'react';
import { addBeneficiary } from '@/actions/user/beneficiary';
import { UserPlus, Loader2, Building2, CreditCard, User, Globe } from 'lucide-react';
import styles from './beneficiaries.module.css';
import toast from 'react-hot-toast';

const initialState = { message: '', success: false };

export default function BeneficiaryForm() {
    const [state, action, isPending] = useActionState(addBeneficiary, initialState);

    // 👇 1. Watch for Server Errors
    useEffect(() => {
        if (state?.message && !state.success) {
            toast.error(state.message);
        }
    }, [state]);

    if (state.success) {
        return (
            <div className={styles.successBox}>
                <h3>Success!</h3>
                <p>Beneficiary saved to your contacts.</p>
                <button onClick={() => window.location.reload()} className={styles.btnSecondary}>
                    Add Another
                </button>
            </div>
        );
    }

    return (
        <form action={action} className={styles.formStack}>

            <div className={styles.inputGroup}>
                <label>Account Holder Name</label>
                <div className={styles.inputWrapper}>
                    <User size={18} className={styles.icon} />
                    <input name="accountName" placeholder="e.g. John Doe" required className={styles.input} />
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label>Bank Name</label>
                <div className={styles.inputWrapper}>
                    <Building2 size={18} className={styles.icon} />
                    <input name="bankName" placeholder="e.g. Chase Bank" required className={styles.input} />
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label>Account Number / IBAN</label>
                <div className={styles.inputWrapper}>
                    <CreditCard size={18} className={styles.icon} />
                    <input name="accountNumber" placeholder="0000 0000 0000" required minLength={10} className={styles.input} />
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label>Swift / BIC Code (Optional)</label>
                <div className={styles.inputWrapper}>
                    <Globe size={18} className={styles.icon} />
                    <input name="swiftCode" placeholder="ABCDEF12XXX" className={styles.input} />
                </div>
            </div>

            <button disabled={isPending} className={styles.submitBtn}>
                {isPending ? <Loader2 className={styles.spin} /> : <><UserPlus size={20} /> Save Contact</>}
            </button>
        </form>
    );
}