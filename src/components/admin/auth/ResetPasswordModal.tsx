'use client';

import { useActionState } from 'react';
import { adminResetPassword } from '@/actions/admin/users';
import { X, Loader2, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './resetPasswordModal.module.css';

const initialState = { message: '', success: false };

interface Props {
    userId: string;
    onClose: () => void;
    siteName?: string;
}

export default function ResetPasswordModal({ userId, onClose, siteName }: Props) {
    const [state, action, isPending] = useActionState(adminResetPassword, initialState);

    if (state.success) {
        toast.success("Password reset successfully!");
        onClose();
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>

                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>
                        <KeyRound size={20} className={styles.headerIcon} />
                        Reset Password
                    </h3>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={20} />
                    </button>
                </div>

                <p className={styles.description}>
                    Enter a new temporary password. The user should change this immediately after logging in.
                </p>

                <form action={action}>
                    <input type="hidden" name="userId" value={userId} />

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>New Temporary Password</label>
                        <input
                            name="newPassword"
                            type="text"
                            placeholder={`e.g. ${siteName}2026!`}
                            required
                            className={styles.input}
                            autoComplete="off"
                        />
                    </div>

                    {state.message && !state.success && (
                        <div className={styles.errorMsg}>{state.message}</div>
                    )}

                    <button type="submit" disabled={isPending} className={styles.confirmBtn}>
                        {isPending ? <Loader2 className={styles.spin} size={20} /> : 'Set New Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}