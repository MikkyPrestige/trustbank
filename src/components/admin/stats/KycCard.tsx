import { ShieldCheck, CheckCircle } from "lucide-react";
import styles from "./stats.module.css";

interface Props {
    count: number;
}

export default function KycCard({ count }: Props) {
    const hasBacklog = count > 5;

    return (
        <div className={styles.richCard}>
            <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>Pending KYC</span>
                <div className={`${styles.iconWrapper} ${hasBacklog ? styles.iconRed : styles.iconBlue}`}>
                    <ShieldCheck size={20} />
                </div>
            </div>

            <div className={styles.cardValue}>
                {count}
            </div>

            <div className={styles.cardSubtext}>
                {count > 0 ? (
                    <span className={hasBacklog ? styles.textDanger : styles.textMuted}>
                        {count} {count === 1 ? 'user' : 'users'} waiting for review
                    </span>
                ) : (
                    <span className={styles.statusSafe}>
                        <CheckCircle size={14} className={styles.inlineIcon} />
                        Up to date
                    </span>
                )}
            </div>
        </div>
    );
}