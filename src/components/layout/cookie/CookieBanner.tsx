'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import styles from './cookie.module.css';

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('trustbank_consent');

        if (consent === 'true') {
            // initGoogleAnalytics();
        }

        if (!consent) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('trustbank_consent', 'true');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('trustbank_consent', 'false');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className={styles.banner}>
            <button className={styles.closeIcon} onClick={handleDecline}>
                <X size={18} />
            </button>

            <div className={styles.header}>
                <div className={styles.iconBox}>
                    <ShieldCheck size={20} />
                </div>
                <h3 className={styles.title}>Security & Privacy</h3>
            </div>

            <p className={styles.text}>
                We use encryption cookies to secure your session and enhance banking performance.
                We do not sell your personal data.
            </p>

            <div className={styles.actions}>
                <button onClick={handleDecline} className={styles.declineBtn}>
                    Necessary Only
                </button>
                <button onClick={handleAccept} className={styles.acceptBtn}>
                    Accept Securely
                </button>
            </div>
        </div>
    );
}