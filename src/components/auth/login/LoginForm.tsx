'use client';

import { useActionState, useState } from 'react';
import { login } from '@/actions/user/login';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react';
import styles from './LoginForm.module.css';

export default function LoginForm() {
    const [state, action, isPending] = useActionState(login, undefined);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className={styles.pageWrapper}>

            <div className={styles.ambientMesh}></div>

            <div className={styles.formContainer} style={{ maxWidth: '480px' }}>

                {/* 2. Header */}
                <div className={styles.header}>
                    <div className={styles.brandBadge}>
                        <ShieldCheck size={16} />
                        <span>Secure Session</span>
                    </div>
                    <h1>Welcome Back</h1>
                    <p>Access your digital vault.</p>
                </div>

                {/* 3. Glass Form */}
                <form action={action} className={styles.glassForm}>

                    {/* Error Alert */}
                    {state?.message && (
                        <div className={styles.errorBanner}>
                            {state.message}
                        </div>
                    )}

                    {/* Email Input */}
                    <div className={styles.inputWrapper}>
                        <label>Email Address</label>
                        <div className={styles.inputIconBox}><Mail size={18} /></div>
                        <input
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    {/* Password Input */}
                    <div className={styles.inputWrapper}>
                        <div className={styles.labelRow}>
                            <label>Password</label>
                            <Link href="/forgot-password" className={styles.forgotLink}>
                                Forgot?
                            </Link>
                        </div>

                        <div className={styles.inputIconBox}><Lock size={18} /></div>
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />

                        {/* Toggle Visibility */}
                        <button
                            type="button"
                            className={styles.eyeBtn}
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* Submit Button */}
                    <div className={styles.footer}>
                        <button disabled={isPending} className={styles.primaryBtn}>
                            {isPending ? (
                                <>Authenticating <Loader2 size={18} className={styles.spin} /></>
                            ) : (
                                <>Sign In to Dashboard <ArrowRight size={18} /></>
                            )}
                        </button>

                        <div className={styles.loginLink}>
                            New to TrustBank? <Link href="/register">Open an Account</Link>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
}