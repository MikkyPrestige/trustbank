'use client';

import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import { login } from '@/actions/user/login';
import Link from 'next/link';
import { Lock, Mail, Eye, EyeOff, X, ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import styles from './styles/LoginModal.module.css';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    // Standard Next.js Server Action Hook
    const [state, action, isPending] = useActionState(login, undefined);

    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            {/* Stop propagation so clicking inside doesn't close it */}
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

                {/* CLOSE BUTTON */}
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={20} />
                </button>

                {/* HEADER: SECURITY BADGE */}
                <div className={styles.header}>
                    <div className={styles.securityBadge}>
                        <ShieldCheck size={14} className={styles.shieldIcon} />
                        <span>Secure Connection • 256-bit</span>
                    </div>
                    <h2>Welcome Back</h2>
                    <p>Enter your credentials to access the vault.</p>
                </div>

                {/* THE FORM */}
                <form action={action} className={styles.form}>

                    {/* ERROR ALERT */}
                    {state?.message && (
                        <div className={styles.errorAlert}>
                            {state.message}
                        </div>
                    )}

                    {/* EMAIL FIELD */}
                    <div className={`${styles.inputGroup} ${focusedField === 'email' ? styles.focused : ''}`}>
                        <div className={styles.iconBox}>
                            <Mail size={18} />
                        </div>
                        <div className={styles.fieldWrapper}>
                            <label className={styles.floatingLabel}>Email Address</label>
                            <input
                                name="email"
                                type="email"
                                required
                                className={styles.input}
                                onFocus={() => setFocusedField('email')}
                                onBlur={(e) => !e.target.value && setFocusedField(null)}
                                onChange={(e) => e.target.value && setFocusedField('email')}
                            />
                        </div>
                    </div>

                    {/* PASSWORD FIELD */}
                    <div className={`${styles.inputGroup} ${focusedField === 'password' ? styles.focused : ''}`}>
                        <div className={`${styles.iconBox} ${focusedField === 'password' ? styles.iconLocked : ''}`}>
                            <Lock size={18} />
                        </div>
                        <div className={styles.fieldWrapper}>
                            <label className={styles.floatingLabel}>Password</label>
                            <input
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                className={styles.input}
                                onFocus={() => setFocusedField('password')}
                                onBlur={(e) => !e.target.value && setFocusedField(null)}
                                onChange={(e) => e.target.value && setFocusedField('password')}
                            />
                        </div>
                        {/* TOGGLE VISIBILITY */}
                        <button
                            type="button"
                            className={styles.eyeBtn}
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* FORGOT PASSWORD ROW */}
                    <div className={styles.extrasRow}>
                        <label className={styles.rememberMe}>
                            <input type="checkbox" name="remember" />
                            <span>Remember device</span>
                        </label>
                        <Link href="/forgot-password" className={styles.forgotLink}>
                            Forgot Password?
                        </Link>
                    </div>

                    {/* SUBMIT BUTTON */}
                    <button type="submit" disabled={isPending} className={styles.submitBtn}>
                        {isPending ? (
                            <>Authenticating <Loader2 size={18} className={styles.spinner} /></>
                        ) : (
                            <>Access Dashboard <ArrowRight size={18} /></>
                        )}
                    </button>

                    {/* FOOTER */}
                    <div className={styles.footer}>
                        New to TrustBank? <Link href="/register">Open an Account</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}