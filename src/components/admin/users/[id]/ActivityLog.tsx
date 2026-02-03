'use client';

import {
    ShieldAlert,
    ShieldCheck,
    Key,
    LogIn,
    AlertTriangle,
    Bell,
    CreditCard
} from 'lucide-react';
import styles from './users.module.css';

interface ActivityLogProps {
    logs: any[];
}

export default function ActivityLog({ logs }: ActivityLogProps) {

    const getIcon = (type: string, title: string) => {
        if (type === 'SECURITY' || title.includes('Login')) return <LogIn size={14} />;
        if (title.includes('Locked')) return <ShieldAlert size={14} color="#ef4444" />;
        if (title.includes('PIN') || title.includes('Password')) return <Key size={14} />;
        if (type === 'WARNING') return <AlertTriangle size={14} color="#f59e0b" />;
        if (type === 'SUCCESS') return <ShieldCheck size={14} color="#22c55e" />;
        return <Bell size={14} />;
    };

    if (logs.length === 0) {
        return <div className={styles.emptySmall}>No recent activity recorded.</div>;
    }

    return (
        <div className={styles.timeline}>
            {logs.map((log) => (
                <div key={log.id} className={styles.timelineItem}>
                    <div className={styles.timelineIcon}>
                        {getIcon(log.type, log.title)}
                    </div>
                    <div className={styles.timelineContent}>
                        <div className={styles.timelineHeader}>
                            <span className={styles.timelineTitle}>{log.title}</span>
                            <span className={styles.timelineDate}>
                                {new Date(log.createdAt).toLocaleString()}
                            </span>
                        </div>
                        <p className={styles.timelineMsg}>{log.message}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}