'use client';

import { MessageCircle, Clock, CheckCircle } from 'lucide-react';
import styles from './support.module.css';
import Link from 'next/link';

interface Ticket {
    id: string;
    subject: string;
    status: string;
    priority: string;
    createdAt: Date;
    updatedAt: Date;
}

export default function TicketList({ tickets }: { tickets: Ticket[] }) {
    if (tickets.length === 0) {
        return (
            <div className={styles.emptyState}>
                <MessageCircle size={48} style={{ opacity: 0.2 }} />
                <h3>No Tickets Found</h3>
                <p>You haven&apos;t opened any support requests yet.</p>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'var(--primary)';
            case 'CLOSED': return 'var(--success)';
            default: return 'var(--warning)';
        }
    };

    const getStatusIcon = (status: string) => {
        if (status === 'CLOSED') return <CheckCircle size={14} />;
        return <Clock size={14} />;
    };

    return (
        <div className={styles.list}>
            {tickets.map(ticket => (
                <Link href={`/dashboard/support/${ticket.id}`} key={ticket.id} className={styles.ticketCard}>
                    <div className={styles.ticketLeft}>
                        <div className={styles.iconBox} style={{ color: getStatusColor(ticket.status) }}>
                            <MessageCircle size={20} />
                        </div>
                        <div>
                            <h4 className={styles.subject}>{ticket.subject}</h4>
                            <div className={styles.meta}>
                                <span className={styles.id}>#{ticket.id.slice(-6).toUpperCase()}</span>
                                <span className={styles.date}>
                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.ticketRight}>
                        <span className={styles.priorityBadge} data-priority={ticket.priority}>
                            {ticket.priority}
                        </span>
                        <span className={styles.statusBadge} style={{
                            background: `${getStatusColor(ticket.status)}15`,
                            color: getStatusColor(ticket.status)
                        }}>
                            {getStatusIcon(ticket.status)} {ticket.status}
                        </span>
                    </div>
                </Link>
            ))}
        </div>
    );
}