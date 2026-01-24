'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createFaq, updateFaq, deleteFaq } from '@/actions/admin/faqs';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './faqs.module.css';
import { FaqItem } from '@prisma/client';

interface Props {
    initialFaqs: FaqItem[];
}

const CATEGORIES = ["Security", "Transfers", "Account & Cards", "General"];

export default function FaqClientManager({ initialFaqs }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<FaqItem | null>(null);

    // Form State
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [category, setCategory] = useState('General');
    const [order, setOrder] = useState(0);

    // --- HANDLERS ---

    const openAddModal = () => {
        setEditingItem(null);
        setQuestion('');
        setAnswer('');
        setCategory('General');
        setOrder(initialFaqs.length + 1);
        setIsModalOpen(true);
    };

    const openEditModal = (item: FaqItem) => {
        setEditingItem(item);
        setQuestion(item.question);
        setAnswer(item.answer);
        setCategory(item.category);
        setOrder(item.order);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this FAQ?")) return;

        setLoading(true);
        try {
            const res = await deleteFaq(id);
            if (res.success) {
                toast.success("FAQ deleted");
                router.refresh();
            } else {
                toast.error(res.message);
            }
        } catch {
            toast.error("Error deleting item");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("question", question);
        formData.append("answer", answer);
        formData.append("category", category);
        formData.append("order", order.toString());

        try {
            let res;
            if (editingItem) {
                res = await updateFaq(editingItem.id, formData);
            } else {
                res = await createFaq(formData);
            }

            if (res.success) {
                toast.success(res.message);
                setIsModalOpen(false);
                router.refresh();
            } else {
                toast.error(res.message);
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* HEADER */}
            <div className={styles.header}>
                <h1 className={styles.title}>FAQ Manager</h1>
                <button onClick={openAddModal} className={styles.addBtn} disabled={loading}>
                    <Plus size={18} /> Add Question
                </button>
            </div>

            {/* LIST */}
            <div className={styles.list}>
                {initialFaqs.length === 0 ? (
                    <p className={styles.emptyState}>No FAQs found. Create one above.</p>
                ) : (
                    initialFaqs.map((faq) => (
                        <div key={faq.id} className={styles.card}>
                            <div className={styles.content}>
                                <h3>
                                    <span className={styles.orderBadge}>#{faq.order}</span>
                                    {faq.question}
                                </h3>
                                <p>{faq.answer}</p>
                            </div>
                            <div className={styles.actions}>
                                <button
                                    onClick={() => openEditModal(faq)}
                                    className={styles.iconBtn}
                                    disabled={loading}
                                    title="Edit"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(faq.id)}
                                    className={`${styles.iconBtn} ${styles.deleteBtn}`}
                                    disabled={loading}
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>
                                {editingItem ? 'Edit Question' : 'New Question'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className={styles.closeModalBtn}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Category</label>
                                <select
                                    className={styles.input}
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Question</label>
                                <input
                                    className={styles.input}
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    placeholder="e.g. How do I reset my password?"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Answer</label>
                                <textarea
                                    className={styles.textarea}
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    placeholder="Enter the detailed answer here..."
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Sort Order</label>
                                <input
                                    type="number"
                                    className={`${styles.input} ${styles.shortInput}`}
                                    value={order}
                                    onChange={(e) => setOrder(parseInt(e.target.value))}
                                />
                                <small className={styles.helpText}>
                                    Lower numbers appear first.
                                </small>
                            </div>

                            <button type="submit" className={styles.submitBtn} disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : (editingItem ? 'Update FAQ' : 'Create FAQ')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}