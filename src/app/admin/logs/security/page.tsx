import { getSecurityLogs } from '@/actions/admin/security-log-actions';
import { requireAdmin } from '@/lib/auth/admin-auth';
import styles from './securityLogs.module.css';

export const metadata = {
    title: 'Security Logs | Admin',
};

export default async function SecurityLogsPage() {
    await requireAdmin();

    const data = await getSecurityLogs(1, 100);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Security Logs</h1>
            <p className={styles.subtitle}>Detailed record of all high‑severity security events.</p>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Action</th>
                            <th>Level</th>
                            <th>Details</th>
                            <th>IP Address</th>
                            <th>User / Admin</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.logs.map((log) => (
                            <tr key={log.id}>
                                <td className={styles.actionCell}>{log.action}</td>
                                <td>
                                    <span className={`${styles.levelBadge} ${styles[log.level.toLowerCase()]}`}>
                                        {log.level}
                                    </span>
                                </td>
                                <td className={styles.detailsCell}>
                                    {log.details ? JSON.stringify(log.details) : '—'}
                                </td>
                                <td>{log.ipAddress || '—'}</td>
                                <td>{log.userId || log.adminId || '—'}</td>
                                <td>{new Date(log.createdAt).toLocaleString()}</td>
                            </tr>
                        ))}
                        {data.logs.length === 0 && (
                            <tr>
                                <td colSpan={6} className={styles.empty}>
                                    No security events found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className={styles.footer}>
                Showing {data.logs.length} of {data.total} events
            </div>
        </div>
    );
}