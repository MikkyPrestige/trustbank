'use client';

import { useState, useActionState } from 'react';
import { adminReplyTicket, closeTicket } from '@/actions/admin/support';
import styles from './support.module.css';
import { Send, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
    id: string;
    sender: string;
    message: string;
    createdAt: Date;
}

export default function AdminChat({ ticketId, messages, status }: { ticketId: string, messages: Message[], status: string }) {
    const [replyState, replyAction, isReplying] = useActionState(async (prev: any, formData: FormData) => {
        const result = await adminReplyTicket(ticketId, formData.get('message') as string);
        if (!result.success) toast.error(result.message);
        return result;
    }, null);

    const [isClosing, setIsClosing] = useState(false);

    const handleClose = async () => {
        if (!confirm("Are you sure you want to close this ticket?")) return;
        setIsClosing(true);
        const res = await closeTicket(ticketId);
        if (res.success) toast.success("Ticket Closed");
        else toast.error(res.message);
        setIsClosing(false);
    };

    const isClosed = status === 'CLOSED';

    return (
        <div className={styles.chatContainer}>
            <div className={styles.chatHeader}>
                <div className={styles.ticketInfo}>
                    <h2 className={styles.ticketTitle}>Ticket Support</h2>
                    <span className={styles.ticketId}>ID: {ticketId}</span>
                </div>
                {!isClosed && (
                    <button onClick={handleClose} disabled={isClosing} className={styles.closeBtn}>
                        {isClosing ? 'Closing...' : 'Close Ticket'}
                    </button>
                )}
                {isClosed && <span className={styles.statusBadge + ' ' + styles.closed}>Ticket Closed</span>}
            </div>

            <div className={styles.messageList}>
                {messages.map((m) => (
                    <div
                        key={m.id}
                        className={`${styles.message} ${m.sender === 'ADMIN' ? styles.adminMsg : styles.userMsg}`}
                    >
                        <div className={styles.msgContent}>
                            {m.message}
                        </div>
                        <div className={styles.msgMeta}>
                            {m.sender === 'ADMIN' ? 'You' : 'User'} • {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                ))}
            </div>

            {!isClosed ? (
                <form action={replyAction} className={styles.inputArea}>
                    <input
                        name="message"
                        placeholder="Type a reply..."
                        required
                        autoComplete="off"
                        className={styles.input}
                    />
                    <button disabled={isReplying} className={styles.sendBtn}>
                        {isReplying ? <Loader2 className={styles.spin} size={20} /> : <Send size={20} />}
                    </button>
                </form>
            ) : (
                <div className={styles.closedNotice}>
                    <Lock size={20} className={styles.lockIcon} /> This conversation is closed.
                </div>
            )}
        </div>
    );
}