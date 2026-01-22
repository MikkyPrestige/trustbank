'use client';

import { useEffect } from 'react';
import { ServerCrash, RefreshCcw, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import styles from './error.module.css';

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Admin Panel Error:", error);
    }, [error]);

    return (
        <div className={styles.container}>
            <div className={styles.iconBox}>
                <ServerCrash size={48} strokeWidth={1.5} />
            </div>

            <h2 className={styles.title}>Administrative Console Error</h2>

            <p className={styles.message}>
                An unexpected error occurred while processing your request.
                This incident has been logged. Please attempt to refresh the data.
            </p>

            <div className={styles.actions}>
                <button
                    onClick={() => reset()}
                    className={styles.retryBtn}
                >
                    <RefreshCcw size={18} /> Retry Action
                </button>

                <Link href="/admin" className={styles.dashboardBtn}>
                    <LayoutDashboard size={18} className={styles.btnIcon} />
                    Return to Dashboard
                </Link>
            </div>

            <div className={styles.errorCode}>
                Error Digest: {error.digest || 'Unknown'}
            </div>
        </div>
    );
}