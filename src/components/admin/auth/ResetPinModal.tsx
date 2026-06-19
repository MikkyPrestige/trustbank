'use client';

import { useActionState } from 'react';
import { adminResetPin } from '@/actions/admin/users';
import { X, Loader2, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './resetPasswordModal.module.css';

const initialState = { message: '', success: false };

interface Props {
    userId: string;
    onClose: () => void;
}

export default function ResetPinModal({ userId, onClose }: Props) {
    const [state, action, isPending] = useActionState(adminResetPin, initialState);

    if (state.success) {
        toast.success("Transaction PIN reset successfully!");
        onClose();
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>

                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>
                        <Hash size={20} className={styles.headerIcon} />
                        Reset Transaction PIN
                    </h3>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={20} />
                    </button>
                </div>

                <p className={styles.description}>
                    Enter a new 4-digit PIN for the user. They should update it from Settings after logging in.
                </p>

                <form action={action}>
                    <input type="hidden" name="userId" value={userId} />

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>New 4-Digit PIN</label>
                        <input
                            name="newPin"
                            type="text"
                            inputMode="numeric"
                            maxLength={4}
                            pattern="\d{4}"
                            placeholder="e.g. 1234"
                            required
                            className={styles.input}
                            autoComplete="off"
                            style={{ letterSpacing: '6px', textAlign: 'center', fontFamily: 'monospace', fontSize: '1.2rem' }}
                        />
                    </div>

                    {state.message && !state.success && (
                        <div className={styles.errorMsg}>{state.message}</div>
                    )}

                    <button type="submit" disabled={isPending} className={styles.confirmBtn}>
                        {isPending ? <Loader2 className={styles.spin} size={20} /> : 'Set New PIN'}
                    </button>
                </form>
            </div>
        </div>
    );
}
