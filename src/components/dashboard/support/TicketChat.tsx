'use client';

import { useActionState, useRef, useEffect } from 'react';
import { replyToTicket } from '@/actions/user/support';
import { Send, User, ShieldCheck, Loader2 } from 'lucide-react';
import styles from './support.module.css';

interface Message {
    id: string;
    sender: string;
    message: string;
    createdAt: Date;
}

interface Ticket {
    id: string;
    status: string;
    messages: Message[];
}

export default function TicketChat({ ticket }: { ticket: Ticket }) {
    const [state, action, isPending] = useActionState(replyToTicket, undefined);
    const formRef = useRef<HTMLFormElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on load or new message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [ticket.messages]);

    // Reset form on success
    useEffect(() => {
        if (state?.success) {
            formRef.current?.reset();
        }
    }, [state]);

    return (
        <div className={styles.chatContainer}>
            {/* MESSAGES AREA */}
            <div className={styles.messagesArea}>
                {ticket.messages.map((msg) => {
                    const isMe = msg.sender === 'USER';
                    return (
                        <div key={msg.id} className={`${styles.msgRow} ${isMe ? styles.msgRight : styles.msgLeft}`}>
                            {!isMe && (
                                <div className={styles.avatarSmall}>
                                    <ShieldCheck size={16} />
                                </div>
                            )}
                            <div className={`${styles.bubble} ${isMe ? styles.bubbleMe : styles.bubbleAdmin}`}>
                                <div className={styles.msgHeader}>
                                    <span>{isMe ? 'You' : 'Support Team'}</span>
                                    <span className={styles.msgTime}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p>{msg.message}</p>
                            </div>
                            {isMe && (
                                <div className={styles.avatarSmall} style={{ background: 'var(--bg-app)' }}>
                                    <User size={16} />
                                </div>
                            )}
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* REPLY INPUT */}
            <div className={styles.inputArea}>
                {ticket.status === 'CLOSED' ? (
                    <div className={styles.closedBanner}>
                        This ticket is closed. Reply to re-open it.
                    </div>
                ) : null}

                <form action={action} ref={formRef} className={styles.replyForm}>
                    <input type="hidden" name="ticketId" value={ticket.id} />
                    <input
                        name="message"
                        required
                        placeholder="Type your reply..."
                        className={styles.chatInput}
                        autoComplete="off"
                    />
                    <button disabled={isPending} className={styles.sendBtn}>
                        {isPending ? <Loader2 className={styles.spin} size={20} /> : <Send size={20} />}
                    </button>
                </form>
            </div>
        </div>
    );
}