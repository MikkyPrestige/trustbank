'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { login } from '@/actions/user/login';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import styles from './styles/LoginForm.module.css';

interface LoginFormProps {
    siteName?: string;
    allowRegister: boolean;
}

export default function LoginForm({ siteName, allowRegister }: LoginFormProps) {
    const [state, action, isPending] = useActionState(login, undefined);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const callbackUrl = searchParams.get("callbackUrl");

    useEffect(() => {
        if (state?.redirect) {
            router.push(state.redirect);
        }
    }, [state, router]);

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.ambientMesh}></div>
            <div className={styles.formContainer}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.headerTitle}>Welcome Back</h1>
                        <p className={styles.headerSubTitle}>Access your {siteName} digital vault.</p>
                    </div>
                </div>

                <form action={action} className={styles.glassForm}>
                    <input type="hidden" name="callbackUrl" value={callbackUrl || "/dashboard"} />
                    {state?.message && (
                        <div className={styles.errorBanner}>
                            {state.message}
                        </div>
                    )}

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
                        <button
                            type="button"
                            className={styles.eyeBtn}
                            onClick={() => setShowPassword(!showPassword)}
                            title={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <div className={styles.footer}>
                        <button disabled={isPending} className={styles.primaryBtn}>
                            {isPending ? (
                                <>Authenticating <Loader2 size={18} className={styles.spin} /></>
                            ) : (
                                <>Sign In to Dashboard <ArrowRight size={18} /></>
                            )}
                        </button>

                        {allowRegister ? (
                            <div className={styles.loginLink}>
                                New to {siteName}?
                                <Link href={callbackUrl
                                    ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`
                                    : "/register"}
                                >
                                    Open an Account
                                </Link>
                            </div>
                        ) : (
                            <div className={`${styles.loginLink} ${styles.loginLinkText}`}>
                                Registration is currently invite-only.
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}