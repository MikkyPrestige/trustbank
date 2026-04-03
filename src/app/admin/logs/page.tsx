import { db } from "@/lib/db";
import styles from "./logs.module.css";
import { ShieldAlert, User, ChevronLeft, ChevronRight, Globe, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin-auth";

export default async function AdminAuditLogsPage({
    searchParams
}: {
    searchParams: Promise<{ page?: string }>
}) {
    await requireAdmin();

    const { page } = await searchParams;
    const currentPage = Number(page) || 1;
    const pageSize = 15;
    const skip = (currentPage - 1) * pageSize;

    const [logs, totalLogs] = await Promise.all([
        db.adminLog.findMany({
            take: pageSize,
            skip: skip,
            orderBy: { createdAt: 'desc' },
            include: { admin: { select: { fullName: true, email: true } } }
        }),
        db.adminLog.count()
    ]);

    const totalPages = Math.ceil(totalLogs / pageSize);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    <ShieldAlert size={28} className={styles.icon} />
                    Security & Audit Logs
                </h1>
                <p className={styles.subtitle}>
                    Monitoring {totalLogs} events. Includes staff actions, security alerts, and system changes.
                </p>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Risk</th>
                            <th>Status</th>
                            <th>Actor</th>
                            <th>Action</th>
                            <th>Details</th>
                            <th>IP Address</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.id} className={log.level === 'CRITICAL' ? styles.rowCritical : ''}>
                                <td>
                                    <span className={`${styles.badge} ${getLevelStyle(log.level, styles)}`}>
                                        {log.level}
                                    </span>
                                </td>

                                <td>
                                    <div className={styles.statusCell}>
                                        {log.status === 'SUCCESS' && <CheckCircle size={20} className={styles.iconSuccess} />}
                                        {log.status === 'FAILED' && <AlertTriangle size={20} className={styles.iconWarning} />}
                                        {log.status === 'BLOCKED' && <XCircle size={20} className={styles.iconError} />}
                                    </div>
                                </td>

                                <td>
                                    {log.admin ? (
                                        <div className={styles.adminInfo}>
                                            <User size={16} className={styles.userIcon} />
                                            <div className={styles.userInfoCol}>
                                                <span className={styles.userName}>{log.admin.fullName}</span>
                                                <span className={styles.userEmail}>{log.admin.email}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className={styles.anonymous}>System / Guest</span>
                                    )}
                                </td>

                                <td>
                                    <span className={styles.actionName}>
                                        {log.action.replace(/_/g, ' ')}
                                    </span>
                                </td>

                                <td className={styles.mono}>
                                    {log.metadata ? (
                                        <code className={styles.code} title={log.metadata}>
                                            {formatMetadata(log.metadata)}
                                        </code>
                                    ) : '-'}
                                </td>

                                <td>
                                    <div className={styles.ipCell}>
                                        <Globe size={16} className={styles.globeIcon} />
                                        <span>{log.ipAddress || 'Unknown'}</span>
                                    </div>
                                </td>

                                <td className={styles.dateCell}>
                                    {new Date(log.createdAt).toLocaleString(undefined, {
                                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                </td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan={7} className={styles.empty}>No logs recorded yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <p className={styles.pageInfo}>
                        Page <strong>{currentPage}</strong> of {totalPages}
                    </p>
                    <div className={styles.pageBtns}>
                        <Link
                            href={`?page=${currentPage - 1}`}
                            className={`${styles.navBtn} ${currentPage <= 1 ? styles.disabled : ''}`}
                            aria-disabled={currentPage <= 1}
                        >
                            <ChevronLeft size={18} /> Prev
                        </Link>
                        <Link
                            href={`?page=${currentPage + 1}`}
                            className={`${styles.navBtn} ${currentPage >= totalPages ? styles.disabled : ''}`}
                            aria-disabled={currentPage >= totalPages}
                        >
                            Next <ChevronRight size={18} />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

function getLevelStyle(level: string, styles: any) {
    if (level === 'CRITICAL') return styles.badgeCritical;
    if (level === 'WARNING') return styles.badgeWarning;
    return styles.badgeInfo;
}

function formatMetadata(metadata: string) {
    try {
        const parsed = JSON.parse(metadata);
        const clean = Object.entries(parsed)
            .filter(([_, v]) => v !== null && v !== undefined && v !== "")
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ");
        return clean.slice(0, 50) + (clean.length > 50 ? '...' : '');
    } catch (e) {
        return metadata.slice(0, 50);
    }
}