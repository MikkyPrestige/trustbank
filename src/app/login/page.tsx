'use client';

import { useActionState } from 'react';
import { login } from '@/actions/login';
import Link from 'next/link';
import styles from './login.module.css';

export default function LoginPage() {
    const [state, action, isPending] = useActionState(login, undefined);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>TrustBank</h1>
                    <p className={styles.subtitle}>Access Your Vault</p>
                </div>

                <form action={action} className={styles.form}>
                    {state?.message && (
                        <div className={styles.error}>
                            {state.message}
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            required
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className={styles.input}
                        />
                    </div>

                    <button type="submit" className={styles.button} disabled={isPending}>
                        {isPending ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div className={styles.footer}>
                    New here?{' '}
                    <Link href="/register" className={styles.link}>
                        Initialize Account
                    </Link>
                </div>
            </div>
        </div>
    );
}