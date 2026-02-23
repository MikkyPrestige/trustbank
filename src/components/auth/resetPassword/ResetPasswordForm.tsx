'use client';

import { useActionState } from "react";
import Link from "next/link";
import { Lock, CheckCircle, AlertCircle, ArrowRight, Loader2, KeyRound } from "lucide-react";
import styles from "./resetPassword.module.css";
import { resetPassword } from "@/actions/user/password";

interface Props {
    token: string;
}

const initialState = {
    message: '',
    success: false
};

export default function ResetPasswordForm({ token }: Props) {
    const resetWithToken = resetPassword.bind(null, token);
    const [state, action, isPending] = useActionState(resetWithToken, initialState);

    if (state.success) {
        return (
            <div className={styles.pageWrapper}>
                <div className={styles.ambientMesh}></div>
                <div className={styles.formContainer}>
                    <div className={styles.glassForm}>
                        <div className={styles.successWrapper}>
                            <div className={styles.successIcon}>
                                <CheckCircle size={32} />
                            </div>
                            <h1>Password Reset!</h1>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                                Your account has been secured with your new credentials.
                            </p>
                            <Link href="/login" className={styles.primaryBtn}>
                                Return to Login <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.ambientMesh}></div>
            <div className={styles.formContainer}>
                <div className={styles.glassForm}>

                    <div className={styles.header}>
                        <div className={styles.brandBadge}>
                            <KeyRound size={14} />
                            <span>Secure Reset</span>
                        </div>
                        <h1>Set New Password</h1>
                        <p>Create a strong password to protect your assets.</p>
                    </div>

                    {/* Error Message */}
                    {state.message && (
                        <div className={styles.errorBanner}>
                            <AlertCircle size={16} /> {state.message}
                        </div>
                    )}

                    <form action={action}>
                        <div className={styles.fieldGroup}>
                            <div className={styles.inputWrapper}>
                                <label className={styles.label}>New Password</label>
                                <div className={styles.inputIcon}>
                                    <Lock size={18} />
                                </div>
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        <div className={styles.fieldGroup}>
                            <div className={styles.inputWrapper}>
                                <label className={styles.label}>Confirm Password</label>
                                <div className={styles.inputIcon}>
                                    <Lock size={18} />
                                </div>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        <button
                            disabled={isPending}
                            className={styles.primaryBtn}
                        >
                            {isPending ? (
                                <><Loader2 className={styles.spin} size={18} /> Updating...</>
                            ) : (
                                <>Update Password <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
}