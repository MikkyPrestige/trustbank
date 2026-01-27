import { db } from "@/lib/db";
import styles from "./logs.module.css";
import { ShieldAlert, User, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin-auth";

export default async function AdminAuditLogsPage({
    searchParams
}: {
    searchParams: Promise<{ page?: string }>
}) {
    await requireAdmin();

    // 1. Pagination Config
    const { page } = await searchParams;
    const currentPage = Number(page) || 1;
    const pageSize = 10;
    const skip = (currentPage - 1) * pageSize;

    // 2. Fetch Logs and Total Count
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
                    Audit Trail
                </h1>
                <p className={styles.subtitle}>
                    Showing {logs.length} of {totalLogs} record(s) of administrative actions. This log cannot be deleted.
                </p>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Admin</th>
                            <th>Action</th>
                            <th>Target ID</th>
                            <th>Details (Metadata)</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.id}>
                                <td>
                                    <div className={styles.adminInfo}>
                                        <User size={14} className={styles.userIcon} />
                                        <span>{log.admin?.fullName || 'Unknown Admin'}</span>
                                    </div>
                                    <div className={styles.email}>{log.admin?.email || 'N/A'}</div>
                                </td>
                                <td>
                                    <span className={getActionBadge(log.action, styles)}>
                                        {log.action.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                <td className={styles.mono}>{log.targetId || '-'}</td>
                                <td className={styles.mono}>
                                    {log.metadata ? (
                                        <code className={styles.code}>
                                            {formatMetadata(log.metadata)}
                                        </code>
                                    ) : '-'}
                                </td>
                                <td className={styles.dateCell}>
                                    {new Date(log.createdAt).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan={5} className={styles.empty}>No logs recorded yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 3. PAGINATION UI */}
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

// Helper to style badges based on action type
function getActionBadge(action: string, styles: any) {
    if (action.includes("DELETE") || action.includes("REMOVE")) return `${styles.badge} ${styles.badgeRed}`;
    if (action.includes("REJECT") || action.includes("SUSPEND") || action.includes("FREEZE")) return `${styles.badge} ${styles.badgeOrange}`;
    if (action.includes("APPROVE") || action.includes("CREDIT") || action.includes("CREATE") || action.includes("PROMOTE")) return `${styles.badge} ${styles.badgeGreen}`;
    return `${styles.badge} ${styles.badgeGray}`;
}

// Helper to clean up metadata display
function formatMetadata(metadata: string) {
    try {
        const parsed = JSON.parse(metadata);
        return JSON.stringify(parsed).slice(0, 60) + (metadata.length > 60 ? '...' : '');
    } catch (e) {
        return metadata.slice(0, 60);
    }
}