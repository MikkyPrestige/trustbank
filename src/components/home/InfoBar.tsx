import { Clock, Phone, Smartphone, Megaphone } from "lucide-react";
import styles from "./home.module.css";

interface InfoBarProps {
    isActive: boolean;
    text: string;
}

export default function InfoBar({ isActive, text }: InfoBarProps) {
    return (
        <section className={styles.infoBarSection}>

            {/* 1. DYNAMIC ANNOUNCEMENT BANNER (Only shows if Active) */}
            {isActive && (
                <div className={styles.announcementBanner}>
                    <div className={styles.announcementContent}>
                        <Megaphone size={18} className={styles.announcementIcon} />
                        <span className={styles.announcementText}>{text}</span>
                    </div>
                </div>
            )}

            {/* 2. STATIC CONTACT STRIP (Always Visible) */}
            <div className={styles.infoContainer}>
                {/* Block 1: Support */}
                <div className={`${styles.infoBlock} ${styles.blueBlock}`}>
                    <Phone size={24} className={styles.infoIcon} />
                    <div className={styles.infoText}>
                        <span className={styles.infoLabel}>24/7 SUPPORT</span>
                        <span className={styles.infoValue}>1-800-TRUST-BK</span>
                    </div>
                </div>

                {/* Block 2: Hours */}
                <div className={`${styles.infoBlock} ${styles.goldBlock}`}>
                    <Clock size={24} className={styles.infoIcon} />
                    <div className={styles.infoText}>
                        <span className={styles.infoLabel}>BRANCH HOURS</span>
                        <span className={styles.infoLink}>Find a location +</span>
                    </div>
                </div>

                {/* Block 3: Digital Access */}
                <div className={`${styles.infoBlock} ${styles.whiteBlock}`}>
                    <Smartphone size={24} className={styles.infoIconDark} />
                    <div className={styles.infoText}>
                        <span className={styles.infoLabel}>MOBILE BANKING</span>
                        <span className={styles.infoLinkDark}>Download App +</span>
                    </div>
                </div>
            </div>
        </section>
    );
}