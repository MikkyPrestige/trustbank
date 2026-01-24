import Link from 'next/link';
import { CreditCard, ShieldAlert, Lock, RefreshCw } from 'lucide-react';
import styles from './help.module.css';

export default function QuickActions() {
    return (
        <>
            <h2 className={styles.sectionTitle}>Quick Actions</h2>
            <div className={styles.quickGrid}>
                <Link href="/login" className={styles.actionCard}>
                    <div className={styles.cardIcon}><Lock size={24} /></div>
                    <div>
                        <h3>Reset Password</h3>
                        <p>Recover access to your account.</p>
                    </div>
                </Link>
                <Link href="#" className={styles.actionCard}>
                    <div className={styles.cardIcon}><CreditCard size={24} /></div>
                    <div>
                        <h3>Lost Card</h3>
                        <p>Freeze card and order replacement.</p>
                    </div>
                </Link>
                <Link href="#" className={styles.actionCard}>
                    <div className={styles.cardIcon}><ShieldAlert size={24} /></div>
                    <div>
                        <h3>Report Fraud</h3>
                        <p>Dispute an unrecognized charge.</p>
                    </div>
                </Link>
                <Link href="/bank" className={styles.actionCard}>
                    <div className={styles.cardIcon}><RefreshCw size={24} /></div>
                    <div>
                        <h3>Routing Number</h3>
                        <p>Find details for direct deposit.</p>
                    </div>
                </Link>
            </div>
        </>
    );
}