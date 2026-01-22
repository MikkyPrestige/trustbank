import { FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import styles from "./stats.module.css";

interface Props {
    count: number;
}

export default function WiresCard({ count }: Props) {
    const isUrgent = count > 0;

    return (
        <div className={`${styles.richCard} ${isUrgent ? styles.cardUrgent : ''}`}>
            <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>Pending Wires</span>
                <div className={`${styles.iconWrapper} ${isUrgent ? styles.iconOrange : styles.iconPurple}`}>
                    <FileText size={20} />
                </div>
            </div>

            <div className={styles.cardValue}>
                {count}
            </div>

            <div className={styles.cardSubtext}>
                {isUrgent ? (
                    <span className={`${styles.statusUrgent} ${styles.textWarning}`}>
                        <AlertCircle size={14} className={styles.inlineIcon} />
                        Action Required
                    </span>
                ) : (
                    <span className={styles.statusSafe}>
                        <CheckCircle2 size={14} className={styles.inlineIcon} />
                        All cleared
                    </span>
                )}
            </div>
        </div>
    );
}