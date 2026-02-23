'use client';

import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { login } from '@/actions/user/login';
import Link from 'next/link';
import { Lock, Mail, Eye, EyeOff, X, ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import styles from './styles/LoginModal.module.css';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToRegister: () => void;
    siteName?: string;
}

export default function LoginModal({ isOpen, onClose, onSwitchToRegister, siteName }: LoginModalProps) {
    const [state, action, isPending] = useActionState(login, undefined);
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

    useEffect(() => {
        if (state?.redirect) {
            onClose();
            router.push(state.redirect);
        }
    }, [state, router, onClose]);

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
                <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                    <X size={20} />
                </button>

                <div className={styles.header}>
                    <div className={styles.securityBadge}>
                        <ShieldCheck size={14} className={styles.shieldIcon} />
                        <span>Secure Connection • 256-bit</span>
                    </div>
                    <h2>Welcome Back</h2>
                    <p>Enter your credentials to access the vault.</p>
                </div>

                <form action={action} className={styles.form}>
                    <input type="hidden" name="callbackUrl" value={callbackUrl} />
                    {state?.message && (
                        <div className={styles.errorAlert}>
                            {state.message}
                        </div>
                    )}

                    {/* EMAIL FIELD */}
                    <div className={`${styles.inputGroup} ${focusedField === 'email' || email ? styles.focused : ''}`}>
                        <div className={styles.iconBox}><Mail size={18} /></div>
                        <div className={styles.fieldWrapper}>
                            <input
                                name="email"
                                type="email"
                                required
                                value={email}
                                placeholder=" "
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                className={styles.input}
                            />
                            <label className={styles.floatingLabel}>Email Address</label>
                        </div>
                    </div>

                    {/* PASSWORD FIELD */}
                    <div className={`${styles.inputGroup} ${focusedField === 'password' || password ? styles.focused : ''}`}>
                        <div className={`${styles.iconBox} ${focusedField === 'password' ? styles.iconLocked : ''}`}>
                            <Lock size={18} />
                        </div>
                        <div className={styles.fieldWrapper}>
                            <input
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                placeholder=" "
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                className={styles.input}
                            />
                            <label className={styles.floatingLabel}>Password</label>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={styles.eyeBtn}
                            title={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <div className={styles.extrasRow}>
                        <label className={styles.rememberMe}>
                            <input type="checkbox" name="remember" />
                            <span>Remember device</span>
                        </label>
                        <Link href="/forgot-password" className={styles.forgotLink}>
                            Forgot Password?
                        </Link>
                    </div>

                    <button type="submit" disabled={isPending} className={styles.submitBtn}>
                        {isPending ? (
                            <>Authenticating <Loader2 size={18} className={styles.spinner} /></>
                        ) : (
                            <>Access Dashboard <ArrowRight size={18} /></>
                        )}
                    </button>

                    <div className={styles.footer}>
                        New to {siteName}?
                        <button
                            type="button"
                            onClick={onSwitchToRegister}
                            className={styles.switchBtn}
                        >
                            Open an Account
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}