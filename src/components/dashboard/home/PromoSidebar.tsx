'use client';

import { useState, useMemo } from "react";
import Link from "next/link";
import { TrendingUp, X } from "lucide-react";
import styles from "./styles/PromoSidebar.module.css";

interface PromoProps {
    settings: any;
    promoId: string;
    onDismiss?: () => void;
}

export default function PromoSidebar({
    settings,
    promoId,
    onDismiss
}: PromoProps) {
    const [isDismissedLocally, setIsDismissedLocally] = useState(false);

    const isDismissedInStorage = useMemo(() => {
        if (typeof window === 'undefined') return true;
        return !!localStorage.getItem(`promo_hide_${promoId}`);
    }, [promoId]);

    const handleDismiss = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDismissedLocally(true);
        localStorage.setItem(`promo_hide_${promoId}`, "true");
        if (onDismiss) onDismiss();
    };

    if (typeof window === 'undefined' || isDismissedInStorage || isDismissedLocally) {
        return null;
    }

    return (
        <div className={styles.card}>
            <button
                type="button"
                onClick={handleDismiss}
                className={styles.closeBtn}
            >
                <X size={16} />
            </button>

            <div className={styles.iconCircle}>
                <TrendingUp size={20} />
            </div>

            <h3 className={styles.title}>{settings.dashboard_promo_title}</h3>

            <div className={styles.rateRow}>
                <span className={styles.rateValue}>{settings.dashboard_promo_rate} %</span>
                <span className={styles.rateLabel}>APY</span>
            </div>

            <p className={styles.desc}>{settings.dashboard_promo_desc}</p>

            <Link href={settings.dashboard_promo_link} className={styles.ctaBtn}>
                {settings.dashboard_promo_btn}
            </Link>
        </div>
    );
}