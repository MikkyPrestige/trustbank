import Link from 'next/link';
import { CreditCard, ShieldAlert, Lock, RefreshCw } from 'lucide-react';
import styles from './help.module.css';

interface QuickActionsProps {
    settings: any;
}

export default function QuickActions({ settings }: QuickActionsProps) {
    return (
        <>
            <h2 className={styles.sectionTitle}>{settings.help_quick_title}</h2>
            <div className={styles.quickGrid}>
                <Link href={settings.help_action1_link} className={styles.actionCard}>
                    <div className={styles.cardIcon}><Lock size={24} /></div>
                    <div>
                        <h3>{settings.help_action1_title}</h3>
                        <p>{settings.help_action1_desc}</p>
                    </div>
                </Link>

                <Link href={settings.help_action2_link} className={styles.actionCard}>
                    <div className={styles.cardIcon}><CreditCard size={24} /></div>
                    <div>
                        <h3>{settings.help_action2_title}</h3>
                        <p>{settings.help_action2_desc}</p>
                    </div>
                </Link>

                <Link href={settings.help_action3_link} className={styles.actionCard}>
                    <div className={styles.cardIcon}><ShieldAlert size={24} /></div>
                    <div>
                        <h3>{settings.help_action3_title}</h3>
                        <p>{settings.help_action3_desc}</p>
                    </div>
                </Link>

                <Link href={settings.help_action4_link} className={styles.actionCard}>
                    <div className={styles.cardIcon}><RefreshCw size={24} /></div>
                    <div>
                        <h3>{settings.help_action4_title}</h3>
                        <p>{settings.help_action4_desc}</p>
                    </div>
                </Link>
            </div>
        </>
    );
}