import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import styles from './not-found.module.css';

export default function NotFound() {
    return (
        <div className={styles.container}>
            <div className={styles.radarCircle}></div>
            <div className={styles.content}>
                <div className={styles.iconWrapper}>
                    <div className={styles.iconGlow}></div>
                    <FileQuestion size={50} strokeWidth={1.5} className={styles.icon} />
                </div>
                <span className={styles.errorCode}>Error 404</span>
                <h1 className={styles.title}>Page Not Found</h1>
                <p className={styles.description}>
                    The resource or page you are looking for has been moved to a secure archive or does not exist.
                </p>
                <div className={styles.actions}>
                    <Link href="/" className={styles.homeBtn}>
                        Return Home
                    </Link>
                    <Link href="/help" className={styles.helpBtn}>
                        Visit Help Center
                    </Link>
                </div>
            </div>
        </div>
    );
}