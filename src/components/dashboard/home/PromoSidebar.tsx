import Link from "next/link";
import { TrendingUp } from "lucide-react";
import styles from "./styles/PromoSidebar.module.css";

interface PromoProps {
    title: string;
    desc: string;
    rate: string;
    btnLabel?: string;
    href?: string;
}

export default function PromoSidebar({ title, desc, rate, btnLabel = "View Offer", href = "/dashboard" }: PromoProps) {
    return (
        <div className={styles.card}>
            <div className={styles.iconCircle}>
                <TrendingUp size={20} />
            </div>

            <h3 className={styles.title}>{title}</h3>

            <div className={styles.rateRow}>
                <span className={styles.rateValue}>{rate}%</span>
                <span className={styles.rateLabel}>APY</span>
            </div>

            <p className={styles.desc}>{desc}</p>

            <Link href={href} className={styles.ctaBtn}>
                {btnLabel}
            </Link>
        </div>
    );
}