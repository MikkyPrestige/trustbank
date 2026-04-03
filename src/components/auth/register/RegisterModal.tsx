'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Check, Loader2, User, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import styles from './styles/RegisterModal.module.css';

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToLogin: () => void;
    siteName?: string;
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin, siteName }: RegisterModalProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
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

    const handleContinue = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const callbackUrl = searchParams.get('callbackUrl');
        const params: Record<string, string> = {
            full_name: name,
            email: email
        };
        if (callbackUrl) {
            params.callbackUrl = callbackUrl;
        }
        const query = new URLSearchParams(params).toString();
        setTimeout(() => {
            setIsSuccess(true);
            setTimeout(() => {
                router.push(`/register?${query}`);
            }, 600);
        }, 1200);
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                    <X size={20} />
                </button>

                <div className={styles.header}>
                    {isLoading ? (
                        <>
                            <div className={styles.loadingPulse}>
                                {isSuccess ? (
                                    <Check size={40} className={styles.checkIcon} />
                                ) : (
                                    <Loader2 size={32} className={styles.spinner} />
                                )}
                            </div>
                            <h2>{isSuccess ? "Identity Verified" : "Securing Your Session..."}</h2>
                            <p>{isSuccess ? "Redirecting to your application form." : "Preparing your encrypted vault..."}</p>
                        </>
                    ) : (
                        <>
                            <div className={styles.securityBadge}>
                                <ShieldCheck size={14} />
                                <span>FDIC Insured Application</span>
                            </div>
                            <h2>Start Your Journey</h2>
                            <p>Begin your application to join {siteName}.</p>
                        </>
                    )}
                </div>

                {!isLoading && (
                    <form onSubmit={handleContinue} className={`${styles.form} ${isLoading ? styles.formFadeOut : ''}`}>
                        <div className={`${styles.inputGroup} ${focusedField === 'name' || name ? styles.focused : ''}`}>
                            <div className={styles.iconBox}><User size={18} /></div>
                            <div className={styles.fieldWrapper}>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    placeholder=" "
                                    value={name}
                                    onFocus={() => setFocusedField('name')}
                                    onBlur={() => setFocusedField(null)}
                                    onChange={(e) => setName(e.target.value)}
                                    autoFocus
                                    className={styles.input}
                                />
                                <label className={styles.floatingLabel}>Full Name</label>
                            </div>
                        </div>

                        <div className={`${styles.inputGroup} ${focusedField === 'email' || email ? styles.focused : ''}`}>
                            <div className={styles.iconBox}><Mail size={18} /></div>
                            <div className={styles.fieldWrapper}>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    placeholder=" "
                                    value={email}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    className={styles.input}
                                />
                                <label className={styles.floatingLabel}>Email Address</label>
                            </div>
                        </div>

                        <button type="submit" className={styles.submitBtn}>
                            Continue to Application <ArrowRight size={18} />
                        </button>

                        <div className={styles.footer}>
                            Already have an account?
                            <button
                                type="button"
                                onClick={() => {
                                    const callbackUrl = searchParams.get('callbackUrl');
                                    if (callbackUrl) {
                                        router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
                                    } else {
                                        onSwitchToLogin();
                                    }
                                }}
                                className={styles.switchBtn}
                            >
                                Sign In
                            </button>
                        </div>

                        <p className={styles.disclaimer}>
                            By continuing, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}