'use client';

import { useState, useActionState, useEffect } from 'react';
import { createTicket } from '@/actions/user/support';
import { createPortal } from 'react-dom';
import { MessageSquarePlus, X, Loader2, Send } from 'lucide-react';
import styles from './support.module.css';
import toast from 'react-hot-toast';

export default function CreateTicketModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [state, action, isPending] = useActionState(createTicket, undefined);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (state?.message) {
            if (state.success) {
                toast.success(state.message);
                const timer = setTimeout(() => setIsOpen(false), 0);
                return () => clearTimeout(timer);
            } else {
                toast.error(state.message);
            }
        }
    }, [state]);

    if (!mounted) return null;

    return (
        <>
            <button onClick={() => setIsOpen(true)} className={styles.createBtn}>
                <MessageSquarePlus size={18} /> Open New Ticket
            </button>

            {isOpen && createPortal(
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3>New Support Ticket</h3>
                            <button onClick={() => setIsOpen(false)} className={styles.closeBtn}><X size={20} /></button>
                        </div>

                        <form action={action} className={styles.form}>
                            <div className={styles.group}>
                                <label>Subject</label>
                                <input name="subject" required placeholder="Brief description of the issue" className={styles.input} />
                            </div>

                            <div className={styles.group}>
                                <label>Priority</label>
                                <select name="priority" className={styles.select}>
                                    <option value="NORMAL">Normal Inquiry</option>
                                    <option value="HIGH">High Priority</option>
                                    <option value="LOW">Low Priority</option>
                                </select>
                            </div>

                            <div className={styles.group}>
                                <label>Message</label>
                                <textarea
                                    name="message"
                                    required
                                    placeholder="Describe your issue in detail..."
                                    className={styles.textarea}
                                    rows={5}
                                />
                            </div>

                            <button disabled={isPending} className={styles.submitBtn}>
                                {isPending ? <Loader2 className={styles.spin} /> : <><Send size={18} /> Submit Ticket</>}
                            </button>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}