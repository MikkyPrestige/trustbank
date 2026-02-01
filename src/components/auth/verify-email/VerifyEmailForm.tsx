'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyOtp } from '@/actions/user/verify-otp';
import { resendOtp } from '@/actions/user/resend-otp';
import { Mail, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import styles from './verifyEmail.module.css';

export default function VerifyEmailForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get('email') || "";

    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);

    // Countdown for redirect
    const [isVerified, setIsVerified] = useState(false);
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        if (isVerified && countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        } else if (isVerified && countdown === 0) {
            router.push('/login?verified=true');
        }
    }, [isVerified, countdown, router]);

    const handleVerify = async () => {
        if (otp.length !== 6) {
            setError("Enter 6-digit code");
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
                setError(res.error || "Verification failed");
            }
        } catch (err) {
            setError("System error");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        setError("");
        setSuccess("");

        try {
            const res = await resendOtp(email);
            if (res.success) {
                setSuccess("New code sent to your inbox.");
            } else {
                setError(res.error || "Failed to send code");
            }
        } catch (err) {
            setError("System error");
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
                        <CheckCircle size={40} />
                    </div>
                    <h1 className={styles.title}>Verified!</h1>
                    <p className={styles.subText}>Redirecting to login in {countdown}s...</p>
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
                    Enter the code sent to <strong>{email || "your email"}</strong>
                </p>

                <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className={styles.input}
                />

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
                    disabled={isVerifying || !email}
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

                    <span className={styles.divider}>•</span>

                    <Link href="/login" className={styles.link}>
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}