'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, User, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import styles from './styles/RegisterModal.module.css';

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    siteName?: string; // 👈 Added prop for CMS Name
}

export default function RegisterModal({ isOpen, onClose, siteName = "TrustBank" }: RegisterModalProps) {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Close on ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            // Lock body scroll
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

        // Simulate a small "processing" delay for effect, then redirect
        setTimeout(() => {
            const query = new URLSearchParams({
                full_name: name,
                email: email
            }).toString();

            router.push(`/register?${query}`);
            onClose();
            setIsLoading(false);
        }, 800);
    };

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
                        <span>FDIC Insured Application</span>
                    </div>
                    <h2>Start Your Journey</h2>
                    <p>Begin your application to join {siteName}.</p>
                </div>

                <form onSubmit={handleContinue} className={styles.form}>
                    {/* Full Name */}
                    <div className={styles.inputGroup}>
                        <div className={styles.iconBox}><User size={18} /></div>
                        <input
                            type="text"
                            required
                            placeholder="Legal Full Name"
                            className={styles.input}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Email */}
                    <div className={styles.inputGroup}>
                        <div className={styles.iconBox}><Mail size={18} /></div>
                        <input
                            type="email"
                            required
                            placeholder="Email Address"
                            className={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button type="submit" disabled={isLoading} className={styles.submitBtn}>
                        {isLoading ? 'Processing...' : (
                            <>Continue to Application <ArrowRight size={18} /></>
                        )}
                    </button>

                    <p className={styles.disclaimer}>
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </form>
            </div>
        </div>
    );
}