import { AlertTriangle, Info, XCircle } from "lucide-react";
import styles from "./styles/DashboardBanner.module.css";

interface DashboardBannerProps {
    show: boolean;
    type: string;
    message: string;
}

export default function DashboardBanner({ show, type, message }: DashboardBannerProps) {
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
            <div className={styles.iconWrapper}>{getIcon()}</div>
            <p className={styles.message}>{message}</p>
        </div>
    );
}