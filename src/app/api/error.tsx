'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import styles from './error.module.css';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an external service (like Sentry) in production
        console.error('Global Error Caught:', error);
    }, [error]);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>System Temporarily Unavailable</h2>
            <p className={styles.message}>
                Our security systems detected an unexpected interruption.
                Your funds are safe. Please try refreshing the connection.
            </p>
            {/* Attempt to recover by trying to re-render the segment */}
            <button className={styles.button} onClick={() => reset()}>
                Secure Reconnect
            </button>
        </div>
    );
}