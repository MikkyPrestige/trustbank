import { Clock, Phone, Globe, Megaphone } from "lucide-react";
import styles from "./home.module.css";
import Link from "next/link";

interface InfoBarProps {
    isActive: boolean;
    text: string;
    phone: string;
    routingNumber: string;
    swiftCode: string;
    labelSupport: string;
    labelHours: string;
    labelBanking: string;
    labelRouting: string;
    labelSwift: string;
    locationLinkText: string;
    locationLinkUrl: string;
}

export default function InfoBar({
    isActive,
    text,
    phone,
    routingNumber,
    swiftCode,
    labelSupport,
    labelHours,
    labelBanking,
    labelRouting,
    labelSwift,
    locationLinkText,
    locationLinkUrl
}: InfoBarProps) {
    return (
        <section className={styles.infoBarSection}>
            {isActive && (
                <div className={styles.announcementBanner}>
                    <div className={styles.announcementContent}>
                        <Megaphone size={18} className={styles.announcementIcon} />
                        <span className={styles.announcementText}>{text}</span>
                    </div>
                </div>
            )}

            <div className={styles.infoContainer}>
                {/* Support Block */}
                <div className={`${styles.infoBlock} ${styles.blueBlock}`}>
                    <Phone size={24} className={styles.infoIcon} />
                    <div className={styles.infoText}>
                        <span className={styles.infoLabel}>{labelSupport}</span>
                        <span className={styles.infoValue}>{phone}</span>
                    </div>
                </div>

                {/* Hours Block */}
                <div className={`${styles.infoBlock} ${styles.goldBlock}`}>
                    <Clock size={24} className={styles.infoIcon} />
                    <div className={styles.infoText}>
                        <span className={styles.infoLabel}>{labelHours}</span>
                        <Link href={locationLinkUrl} className={styles.infoLink}>
                            {locationLinkText}
                        </Link>
                    </div>
                </div>

                {/* Banking Block */}
                <div className={`${styles.infoBlock} ${styles.whiteBlock}`}>
                    <Globe size={24} className={styles.infoIconDark} />
                    <div className={styles.infoText}>
                        <span className={styles.infoLabel}>{labelBanking}</span>
                        <div className={styles.bankingCodes}>
                            <span title={labelRouting}>
                                {labelRouting}: <strong>{routingNumber}</strong>
                            </span>
                            <span className={styles.divider}>|</span>
                            <span title={labelSwift}>
                                {labelSwift}: <strong>{swiftCode}</strong>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}