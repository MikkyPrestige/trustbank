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
    siteName?: string; // 👈 CMS Prop
}

export default function LoginModal({ isOpen, onClose, siteName = "TrustBank" }: LoginModalProps) {
    const [state, action, isPending] = useActionState(login, undefined);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    // Close on ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

                {/* CLOSE BUTTON */}
                <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                    <X size={20} />
                </button>

                {/* HEADER */}
                <div className={styles.header}>
                    <div className={styles.securityBadge}>
                        <ShieldCheck size={14} className={styles.shieldIcon} />
                        <span>Secure Connection • 256-bit</span>
                    </div>
                    <h2>Welcome Back</h2>
                    <p>Enter your credentials to access the vault.</p>
                </div>

                {/* FORM */}
                <form action={action} className={styles.form}>
                    {state?.message && (
                        <div className={styles.errorAlert}>
                            {state.message}
                        </div>
                    )}

                    {/* EMAIL FIELD */}
                    <div className={`${styles.inputGroup} ${focusedField === 'email' ? styles.focused : ''}`}>
                        <div className={styles.iconBox}><Mail size={18} /></div>
                        <div className={styles.fieldWrapper}>
                            {/* Input comes BEFORE label if using CSS peer selectors, but here we use simple overlay */}
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder=" " // Required for CSS :placeholder-shown trick
                                className={styles.input}
                                onFocus={() => setFocusedField('email')}
                                onBlur={(e) => !e.target.value && setFocusedField(null)}
                                onChange={(e) => e.target.value && setFocusedField('email')}
                            />
                            <label className={styles.floatingLabel}>Email Address</label>
                        </div>
                    </div>

                    {/* PASSWORD FIELD */}
                    <div className={`${styles.inputGroup} ${focusedField === 'password' ? styles.focused : ''}`}>
                        <div className={`${styles.iconBox} ${focusedField === 'password' ? styles.iconLocked : ''}`}>
                            <Lock size={18} />
                        </div>
                        <div className={styles.fieldWrapper}>
                            <input
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                placeholder=" "
                                className={styles.input}
                                onFocus={() => setFocusedField('password')}
                                onBlur={(e) => !e.target.value && setFocusedField(null)}
                                onChange={(e) => e.target.value && setFocusedField('password')}
                            />
                            <label className={styles.floatingLabel}>Password</label>
                        </div>
                        <button
                            type="button"
                            className={styles.eyeBtn}
                            onClick={() => setShowPassword(!showPassword)}
                            title={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* EXTRAS */}
                    <div className={styles.extrasRow}>
                        <label className={styles.rememberMe}>
                            <input type="checkbox" name="remember" />
                            <span>Remember device</span>
                        </label>
                        <Link href="/forgot-password" className={styles.forgotLink}>
                            Forgot Password?
                        </Link>
                    </div>

                    {/* SUBMIT */}
                    <button type="submit" disabled={isPending} className={styles.submitBtn}>
                        {isPending ? (
                            <>Authenticating <Loader2 size={18} className={styles.spinner} /></>
                        ) : (
                            <>Access Dashboard <ArrowRight size={18} /></>
                        )}
                    </button>

                    {/* FOOTER */}
                    <div className={styles.footer}>
                        New to {siteName}? <Link href="/register">Open an Account</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}