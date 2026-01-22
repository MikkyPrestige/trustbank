import { Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";
import styles from "./stats.module.css";

interface Props {
    amount: number;
    trend: number;
}

export default function LiquidityCard({ amount, trend }: Props) {
    const isPositive = trend > 0;
    const isNeutral = trend === 0;

    // Determine the class based on state
    const trendClass = isNeutral
        ? styles.textMuted
        : isPositive ? styles.textSuccess : styles.textDanger;

    return (
        <div className={styles.richCard}>
            <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>System Liquidity</span>
                <div className={`${styles.iconWrapper} ${styles.iconBlue}`}>
                    <Activity size={20} />
                </div>
            </div>

            <div className={styles.cardValue}>
                {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 0
                }).format(amount)}
            </div>

            <div className={styles.cardSubtext}>
                <span className={trendClass}>
                    {isNeutral && <Minus size={14} className={styles.inlineIcon} />}
                    {isPositive && <TrendingUp size={14} className={styles.inlineIcon} />}
                    {!isNeutral && !isPositive && <TrendingDown size={14} className={styles.inlineIcon} />}

                    {/* Logic: Show sign only if not neutral */}
                    {!isNeutral && (isPositive ? '+' : '')}
                    {isNeutral ? 'No change today' : `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(trend)} today`}
                </span>
            </div>
        </div>
    );
}