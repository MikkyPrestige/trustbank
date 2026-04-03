import { ShieldCheck, Headphones, FileText, Shield, Globe } from "lucide-react";
import styles from "./styles/SidebarFooter.module.css";
import Link from "next/link";

interface SidebarFooterProps {
    settings: any;
}

export default function SidebarFooter({ settings }: SidebarFooterProps) {
    return (
        <div className={styles.container}>
            <div className={styles.item}>
                <ShieldCheck size={14} className={styles.icon} />
                <span>{settings.dashboard_sidebar_security_msg}</span>
            </div>
            <div className={styles.item}>
                <Headphones size={14} className={styles.icon} />
                <span>{settings.dashboard_sidebar_support_msg}</span>
            </div>
            <div className={styles.linksSection}>
                <h4 className={styles.sectionTitle}>{settings.dashboard_sidebar_res_title}</h4>
                <ul className={styles.linkList}>
                    <li>
                        <Link href={settings.dashboard_sidebar_res_link1} className={styles.linkItem}>
                            <FileText size={14} /> {settings.dashboard_sidebar_res_label1}
                        </Link>
                        </li>
                    <li>
                        <Link href={settings.dashboard_sidebar_res_link2} className={styles.linkItem}>
                            <Shield size={14} /> {settings.dashboard_sidebar_res_label2}
                        </Link>
                        </li>
                    <li>
                        <Link href={settings.dashboard_sidebar_res_link3} className={styles.linkItem}>
                            <Globe size={14} /> {settings.dashboard_sidebar_res_label3}
                        </Link>
                        </li>
                </ul>
            </div>
        </div>
    );
}