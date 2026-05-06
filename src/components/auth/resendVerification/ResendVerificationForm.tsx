'use client';

import { useState } from 'react';
import { resendOtp } from '@/actions/user/otp';
import Link from 'next/link';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import styles from './ResendVerification.module.css';

export default function ResendVerificationForm() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError('Email is required');
            return;
        }
        setIsPending(true);
        setError('');
        setMessage('');

        try {
            const res = await resendOtp(email);
            if (res.success) {
                setMessage(res.message);
            } else {
                setError(res.error || 'Something went wrong');
            }
        } catch {
            setError('System error. Please try again.');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.ambientMesh}></div>
            <div className={styles.card}>
                <div className={styles.iconWrapper}>
                    <Mail size={32} />
                </div>
                <h1 className={styles.title}>Resend verification email</h1>
                <p className={styles.subtitle}>
                    Enter the email address you used to register. We’ll send you a new
                    verification code if the account exists and hasn’t been verified yet.
                </p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputWrapper}>
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            required
                            className={styles.input}
                            disabled={isPending}
                        />
                    </div>

                    <button type="submit" disabled={isPending || !email} className={styles.button}>
                        {isPending ? 'Sending…' : 'Send verification code'}
                    </button>

                    {message && (
                        <div className={styles.successBanner}>
                            <CheckCircle size={16} /> {message}
                        </div>
                    )}
                    {error && (
                        <div className={styles.errorBanner}>
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}
                </form>

                <div className={styles.backLink}>
                    <Link href="/login">Back to login</Link>
                </div>
            </div>
        </div>
    );
}