'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyOtp, resendOtp } from '@/actions/user/otp';
import { Mail, AlertCircle, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import styles from './verifyEmail.module.css';

function VerifyFormContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [email, setEmail] = useState(searchParams.get('email') || "");
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const callbackUrl = searchParams.get('callbackUrl') || "/dashboard";

    useEffect(() => {
        if (isVerified && countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        } else if (isVerified && countdown === 0) {
            const loginUrl = `/login?verified=true&callbackUrl=${encodeURIComponent(callbackUrl)}&email=${encodeURIComponent(email)}`;
            router.push(loginUrl);
        }
    }, [isVerified, countdown, router, callbackUrl, email]);

    const handleVerify = async () => {
        if (!email) {
            setError("Email address is required");
            return;
        }
        if (otp.length !== 6) {
            setError("Please enter the 6-digit code");
            return;
        }
        setIsVerifying(true);
        setError("");

        try {
            const res = await verifyOtp(email, otp);
            if (res.success) {
                setSuccess("Email verified successfully!");
                setIsVerified(true);
            } else {
                setError(res.error || "Verification failed. Check code and try again.");
            }
        } catch (err) {
            setError("System error. Please try again.");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        if (!email) return;
        setIsResending(true);
        setError("");
        setSuccess("");

        try {
            const res = await resendOtp(email);
            if (res.success) {
                setSuccess("New code sent to your inbox.");
            } else {
                setError(res.error || "Failed to send code.");
            }
        } catch (err) {
            setError("System error.");
        } finally {
            setIsResending(false);
        }
    };

    // --- SUCCESS VIEW ---
    if (isVerified) {
        return (
            <div className={styles.pageWrapper}>
                <div className={styles.card}>
                    <div className={styles.successIcon}>
                        <CheckCircle size={48} />
                    </div>
                    <h1 className={styles.title}>Verified!</h1>
                    <p className={styles.subText}>Your account is active.</p>
                    <div className={styles.timerBox}>
                        Redirecting to login in <strong>{countdown}s</strong>...
                    </div>
                    <button
                        onClick={() => router.push('/login?verified=true')}
                        className={styles.primaryBtn}
                    >
                        Go to Login Now
                    </button>
                </div>
            </div>
        );
    }

    // --- INPUT VIEW ---
    return (
        <div className={styles.pageWrapper}>
            <div className={styles.ambientMesh}></div>
            <div className={styles.card}>
                <div className={styles.iconWrapper}>
                    <Mail size={32} />
                </div>

                <h1 className={styles.title}>Verify Email</h1>
                <p className={styles.subText}>
                    Please enter the code sent to your inbox.
                </p>

                <div className={styles.formGroup}>
                    <div className={styles.inputWrapper}>
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            placeholder="name@example.com"
                        />
                    </div>

                    <div className={styles.inputWrapper}>
                        <label>6-Digit Code</label>
                        <input
                            type="text"
                            maxLength={6}
                            placeholder="123456"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            className={`${styles.input} ${styles.otpInput}`}
                        />
                    </div>
                </div>

                {error && (
                    <div className={styles.errorBanner}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                {success && (
                    <div className={styles.successBanner}>
                        <CheckCircle size={16} /> {success}
                    </div>
                )}

                <button
                    onClick={handleVerify}
                    disabled={isVerifying || !email || otp.length !== 6}
                    className={styles.primaryBtn}
                >
                    {isVerifying ? <Loader2 className={styles.spin} /> : 'Verify Account'}
                </button>

                <div className={styles.footer}>
                    <button
                        onClick={handleResend}
                        disabled={isResending || !email}
                        className={styles.resendBtn}
                    >
                        {isResending ? 'Sending...' : 'Resend Code'}
                    </button>

                    <Link href="/login" className={styles.backLink}>
                        <ArrowLeft size={14} /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailForm() {
    return (
        <Suspense fallback={
            <div className={styles.pageWrapper}>
                <div className={styles.loadingState}>
                    <Loader2 className={styles.spin} />
                </div>
            </div>
        }>
            <VerifyFormContent />
        </Suspense>
    );
}