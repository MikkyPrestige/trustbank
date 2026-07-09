'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminCreateTicket } from '@/actions/admin/support';
import styles from './users.module.css';
import { MessageSquarePlus, Loader2, X, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminNewTicketButton({ userId, userName }: { userId: string, userName: string }) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const close = () => {
        setIsOpen(false);
        setSubject('');
        setMessage('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("subject", subject);
        formData.append("message", message);

        try {
            const res = await adminCreateTicket(formData);
            if (res.success) {
                toast.success(res.message);
                close();
                router.push(`/admin/support/${res.ticketId}`);
            } else {
                toast.error(res.message);
            }
        } catch (err) {
            toast.error("Connection failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button onClick={() => setIsOpen(true)} className={styles.viewBtn}>
                <MessageSquarePlus size={14} /> Message User
            </button>

            {isOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3>Message {userName}</h3>
                            <button onClick={close} className={styles.closeBtn}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <input
                                className={styles.modalInput}
                                placeholder="Subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                                autoFocus
                            />

                            <textarea
                                className={styles.modalTextarea}
                                placeholder="Write your message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                                rows={5}
                            />

                            <button disabled={loading} className={styles.saveBtn}>
                                {loading ? <Loader2 className={styles.spin} size={18} /> : <><Send size={16} /> Send Message</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
