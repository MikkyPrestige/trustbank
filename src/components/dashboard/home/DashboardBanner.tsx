import { AlertTriangle, Info, Mail, Phone, XCircle } from "lucide-react";
import styles from "./styles/DashboardBanner.module.css";

interface DashboardBannerProps {
    show: boolean;
    type: string;
    message: string;
    phone?: string;
    email?: string;
}

export default function DashboardBanner({ show, type, message, phone, email }: DashboardBannerProps) {
    if (!show) return null;

    const getIcon = () => {
        switch (type) {
            case 'warning': return <AlertTriangle size={20} />;
            case 'error': return <XCircle size={20} />;
            default: return <Info size={20} />;
        }
    };

    return (
        <div className={`${styles.banner} ${styles[type]}`}>
            <div className={styles.mainContent}>
                <div className={styles.iconWrapper}>{getIcon()}</div>
                <p className={styles.message}>{message}</p>
            </div>

            {(phone || email) && (
                <div className={styles.supportLinks}>
                    {phone && (
                        <a href={`tel:${phone}`} className={styles.supportItem}>
                            <Phone size={14} /> {phone}
                        </a>
                    )}
                    {email && (
                        <a href={`mailto:${email}`} className={styles.supportItem}>
                            <Mail size={14} /> {email}
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}