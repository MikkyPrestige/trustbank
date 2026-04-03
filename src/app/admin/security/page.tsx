import { getSecurityStats } from "@/actions/admin/security-analytics";
import styles from "./security.module.css";
import { ShieldCheck, AlertTriangle, Activity, Lock, ExternalLink } from "lucide-react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin-auth";

export default async function SecurityDashboard() {
    await requireAdmin();
    const stats = await getSecurityStats();

    if (!stats) return <div>Error loading security data.</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>
                        <Lock className={styles.iconMain} size={28} />
                        Security Command Center
                    </h1>
                    <p className={styles.subtitle}>System health, threat monitoring, and audit trails.</p>
                </div>
                <Link href="/admin/logs" className={styles.logsBtn}>
                    View Full Audit Logs <ExternalLink size={18} />
                </Link>
            </div>

            <div className={styles.grid}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>System Status</span>
                        <ShieldCheck size={20} className={styles.iconSuccess} />
                    </div>
                    <div className={styles.bigNumber}>Secure</div>
                    <p className={styles.cardSub}>All systems operational</p>
                </div>

                <div className={`${styles.card} ${stats.criticalEvents > 0 ? styles.cardAlert : ''}`}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>Critical Alerts (24h)</span>
                        <AlertTriangle size={20} className={stats.criticalEvents > 0 ? styles.iconCritical : styles.iconMuted} />
                    </div>
                    <div className={styles.bigNumber}>{stats.criticalEvents}</div>
                    <p className={styles.cardSub}>Requires immediate attention</p>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>Warnings (24h)</span>
                        <Activity size={20} className={styles.iconWarning} />
                    </div>
                    <div className={styles.bigNumber}>{stats.warnings}</div>
                    <p className={styles.cardSub}>Suspicious activities detected</p>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>Total Events Logged</span>
                        <Activity size={20} className={styles.iconInfo} />
                    </div>
                    <div className={styles.bigNumber}>{stats.totalLogs.toLocaleString()}</div>
                    <p className={styles.cardSub}>Lifetime audit trail volume</p>
                </div>
            </div>

            <div className={styles.feedSection}>
                <h2 className={styles.sectionTitle}>Live Activity Feed</h2>
                <div className={styles.feed}>
                    {stats.recentLogs.map((log) => (
                        <div key={log.id} className={styles.feedItem}>
                            <div className={`${styles.indicator} ${getIndicatorColor(log.level, styles)}`}></div>
                            <div className={styles.feedContent}>
                                <div className={styles.feedTop}>
                                    <span className={styles.actionName}>{log.action.replace(/_/g, ' ')}</span>
                                    <span className={styles.timestamp}>
                                        {new Date(log.createdAt).toLocaleTimeString()}
                                    </span>
                                </div>
                                <div className={styles.feedBottom}>
                                    <span className={styles.actor}>
                                        {log.admin?.email || 'System / Guest'}
                                    </span>
                                    <span className={styles.meta}>
                                        • IP: {log.ipAddress || 'Unknown'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {stats.recentLogs.length === 0 && (
                        <p className={styles.empty}>No recent activity.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function getIndicatorColor(level: string, styles: any) {
    if (level === 'CRITICAL') return styles.indicatorCritical;
    if (level === 'WARNING') return styles.indicatorWarning;
    return styles.indicatorInfo;
}