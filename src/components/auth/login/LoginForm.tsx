'use client';

import { useActionState, useState } from 'react';
import { login } from '@/actions/user/login';
import Image from 'next/image';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react';
import styles from './styles/LoginForm.module.css';

interface LoginFormProps {
    siteName?: string; // 👈 CMS Dynamic Branding
}

export default function LoginForm({ siteName = "TrustBank" }: LoginFormProps) {
    const [state, action, isPending] = useActionState(login, undefined);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className={styles.pageWrapper}>

            {/* 1. Ambient Background */}
            <div className={styles.ambientMesh}></div>

            {/* 2. Main Content */}
            <div className={styles.formContainer}>

                {/* Header */}
                <div className={styles.header}>
                    <Image
                        src="/logo.png"
                        alt={siteName}
                        width={180}
                        height={50}
                        className={styles.logo}
                        priority
                    />
                    <div className={styles.brandBadge}>
                        <ShieldCheck size={14} />
                        <span>Secure Session • 256-bit Encrypted</span>
                    </div>
                    <div>
                        <h1>Welcome Back</h1>
                        <p>Access your {siteName} digital vault.</p>
                    </div>
                </div>

                {/* Glass Form */}
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
                                Forgot Password?
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
                            title={showPassword ? "Hide password" : "Show password"}
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
                            New to {siteName}? <Link href="/register">Open an Account</Link>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
}