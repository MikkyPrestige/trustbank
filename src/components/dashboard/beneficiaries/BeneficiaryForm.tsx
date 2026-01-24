'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { addBeneficiary } from '@/actions/user/beneficiary';
import { UserPlus, Loader2, Building2, CreditCard, User, Globe, Hash } from 'lucide-react';
import styles from './beneficiaries.module.css';
import toast from 'react-hot-toast';

const initialState = { message: '', success: false };

export default function BeneficiaryForm() {
    const [formId, setFormId] = useState(0);
    const router = useRouter();

    const handleReset = () => {
        router.refresh();
        setFormId((prev) => prev + 1);
    };

    return <BeneficiaryFormContent key={formId} onReset={handleReset} />;
}

function BeneficiaryFormContent({ onReset }: { onReset: () => void }) {
    const [state, action, isPending] = useActionState(addBeneficiary, initialState);

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
                <button onClick={onReset} className={styles.btnSecondary}>
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

            <div className={styles.grid2}>
                <div className={styles.inputGroup}>
                    <label>Routing Number (US)</label>
                    <div className={styles.inputWrapper}>
                        <Hash size={18} className={styles.icon} />
                        <input name="routingNumber" placeholder="9 Digits" maxLength={9} className={styles.input} />
                    </div>
                </div>

                <div className={styles.inputGroup}>
                    <label>Swift Code (Intl)</label>
                    <div className={styles.inputWrapper}>
                        <Globe size={18} className={styles.icon} />
                        <input name="swiftCode" placeholder="ABCDEF12" className={styles.input} />
                    </div>
                </div>
            </div>

            <button disabled={isPending} className={styles.submitBtn}>
                {isPending ? <Loader2 className={styles.spin} size={20} /> : <><UserPlus size={20} /> Save Contact</>}
            </button>
        </form>
    );
}