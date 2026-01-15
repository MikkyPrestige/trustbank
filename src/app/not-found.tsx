import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import styles from './not-found.module.css';

export default function NotFound() {
    return (
        <div className={styles.container}>

            {/* Background Radar Animation */}
            <div className={styles.radarCircle}></div>

            <div className={styles.content}>

                {/* Animated Icon */}
                <div className={styles.iconWrapper}>
                    <div className={styles.iconGlow}></div>
                    <FileQuestion size={50} strokeWidth={1.5} className={styles.icon} />
                </div>

                <span className={styles.errorCode}>Error 404</span>
                <h1 className={styles.title}>Coordinates Not Found</h1>
                <p className={styles.description}>
                    The digital asset or page you are looking for has been moved to a secure archive or does not exist in our vault.
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