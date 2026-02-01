import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/content/get-settings";
import styles from "./maintenance.module.css";
import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, ArrowLeft, Clock } from "lucide-react";

// Helper to fetch string settings easily
async function getTextSetting(key: string, fallback: string) {
    const setting = await db.systemSettings.findUnique({ where: { key } });
    return setting?.value || fallback;
}

export default async function MaintenancePage() {
    const [cms, title, message, duration] = await Promise.all([
        getSiteSettings(),
        getTextSetting('maintenance_title', 'System Maintenance'),
        getTextSetting('maintenance_message', 'We are currently performing scheduled upgrades to improve your banking experience.'),
        getTextSetting('maintenance_duration', '~30 Minutes'),
    ]);

    return (
        <div className={styles.container}>
            <div className={styles.card}>

                {/* Dynamic Logo */}
                <div className="flex justify-center mb-6">
                    <Image
                        src={cms.site_logo || "/logo.png"}
                        alt="Bank Logo"
                        width={140}
                        height={40}
                        className="object-contain"
                    />
                </div>

                <div className={styles.iconWrapper}>
                    <AlertTriangle size={48} className={styles.icon} />
                </div>

                {/* Dynamic Title */}
                <h1 className={styles.title}>{title}</h1>

                {/* Dynamic Message */}
                <p className={styles.description}>
                    {message}
                </p>

                {/* Dynamic Duration */}
                <div className={styles.infoBox}>
                    <Clock size={18} className={styles.infoIcon} />
                    <span>Expected duration: {duration}</span>
                </div>

                <Link href="/" className={styles.homeLink}>
                    <ArrowLeft size={16} />
                    Return to Home
                </Link>
            </div>

            <p className={styles.footer}>
                {cms.site_name || "TrustBank"} Operations • Ref: SYS-MAINT-{new Date().getFullYear()}
            </p>
        </div>
    );
}