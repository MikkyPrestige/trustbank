'use client';

import { useEffect } from 'react';
import styles from './error.module.css';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function MainError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Website Error:", error);
    }, [error]);

    return (
        <div className={styles.container}>
            <div className={styles.iconWrapper}>
                <AlertTriangle size={64} className={styles.icon} />
            </div>

            <h2 className={styles.title}>Page Unavailable</h2>

            <p className={styles.message}>
                We encountered an unexpected issue loading this page.
                Please refresh or try again later.
            </p>

            <button className={styles.button} onClick={() => reset()}>
                <RefreshCcw size={20} />Refresh Page
            </button>
        </div>
    );
}