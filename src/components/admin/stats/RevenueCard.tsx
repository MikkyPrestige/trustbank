import { getBankRevenue } from "@/actions/admin/analytics";
import { DollarSign, TrendingUp } from "lucide-react";
import styles from "./stats.module.css";

export default async function RevenueCard() {
    const { totalRevenue, todayRevenue } = await getBankRevenue();

    return (
        <div className={styles.richCard}>
            <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>Bank Revenue</span>
                <div className={`${styles.iconWrapper} ${styles.iconGreen}`}>
                    <DollarSign size={20} />
                </div>
            </div>

            <div className={styles.cardValue}>
                ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>

            <div className={styles.revenueTrend}>
                <TrendingUp size={14} className={todayRevenue > 0 ? styles.trendPositive : ''} />
                <span className={todayRevenue > 0 ? styles.trendPositive : ''}>
                    +${todayRevenue.toLocaleString()} today
                </span>
            </div>
        </div>
    );
}