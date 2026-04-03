'use client';

import { useEffect } from 'react';
import { AlertOctagon, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';
import styles from './error.module.css';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {

    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className={styles.container}>
            <div className={styles.iconBox}>
                <AlertOctagon size={40} strokeWidth={2} />
            </div>

            <h2 className={styles.title}>System Encountered an Issue</h2>

            <p className={styles.message}>
                Don&apos;t worry, your funds are safe. We encountered an unexpected error while processing your request. Our engineering team has been notified.
            </p>

            <div className={styles.actions}>
                <button
                    onClick={() => reset()}
                    className={styles.retryBtn}
                >
                    <RefreshCcw size={20} /> Try Again
                </button>

                <Link href="/dashboard" className={styles.homeBtn}>
                    <Home size={20} className={styles.btnIcon} />
                    Dashboard Home
                </Link>
            </div>
        </div>
    );
}