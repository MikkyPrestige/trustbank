'use client';

import { useActionState } from 'react';
import { login } from '@/actions/user/login';
import Link from 'next/link';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import styles from './auth.module.css';

export default function LoginForm() {
    // Note: Ensure your login action returns { message: string } on error
    const [state, action, isPending] = useActionState(login, undefined);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Welcome Back</h1>
                <p>Access your TrustBank Enterprise vault.</p>
            </div>

            <form action={action} className={styles.form}>

                {/* ERROR ALERT */}
                {state?.message && (
                    <div className={`${styles.alert} ${styles.error}`}>
                        {state.message}
                    </div>
                )}

                <div className={styles.section}>
                    <div className={styles.group}>
                        <label>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                className={styles.input}
                                style={{ paddingLeft: '2.5rem' }} // Space for icon
                            />
                            <Mail
                                size={18}
                                color="#666"
                                style={{ position: 'absolute', left: '12px', top: '12px' }}
                            />
                        </div>
                    </div>

                    <div className={styles.group}>
                        <label>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                name="password"
                                type="password"
                                placeholder="••••••"
                                required
                                className={styles.input}
                                style={{ paddingLeft: '2.5rem' }}
                            />
                            <Lock
                                size={18}
                                color="#666"
                                style={{ position: 'absolute', left: '12px', top: '12px' }}
                            />
                        </div>
                    </div>
                </div>

                <button disabled={isPending} className={styles.submitBtn}>
                    {isPending ? 'Authenticating...' : 'Sign In to Dashboard'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
                    <p style={{ marginBottom: '0.5rem' }}>
                        New to TrustBank? <Link href="/register" className={styles.link}>Open an Account</Link>
                    </p>
                    {/*  Forgot Password Link */}
                    <Link href="/forgot-password" className={styles.link} style={{ fontSize: '0.85rem' }}>Forgot Password?</Link>
                </div>
            </form>
        </div>
    );
}