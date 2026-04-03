'use client';

import Link from 'next/link';
import styles from './support.module.css';

interface Ticket {
    id: string;
    subject: string;
    status: string;
    createdAt: Date;
    user: {
        fullName: string;
        email: string;
    };
}

export default function AdminTicketList({ tickets }: { tickets: Ticket[] }) {
    return (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Subject</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {tickets.length === 0 ? (
                        <tr>
                            <td colSpan={5} className={styles.noTickets}>
                            No tickets found.
                        </td>
                        </tr>
                ) : (
                        tickets.map((t) => (
                <tr key={t.id}>
                    <td>
                        <div className={styles.userCell}>
                            <span className={styles.userFullName}>{t.user.fullName}</span>
                            <span className={styles.userEmail}>{t.user.email}</span>
                        </div>
                    </td>
                    <td className={styles.subjectCell}>{t.subject}</td>
                    <td>
                        <span className={`${styles.statusBadge} ${styles[t.status.toLowerCase()] || ''}`}>
                            {t.status}
                        </span>
                    </td>
                    <td className={styles.dateCell}>{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td>
                        <Link href={`/admin/support/${t.id}`} className={styles.viewBtn}>
                            Manage
                        </Link>
                    </td>
                </tr>
                ))
                    )}
            </tbody>
        </table >
        </div >
    );
}