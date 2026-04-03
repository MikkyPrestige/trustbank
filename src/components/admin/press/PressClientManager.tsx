'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createPressRelease, updatePressRelease, deletePressRelease } from '@/actions/admin/press';
import { Plus, Pencil, Trash2, X, Loader2, ArrowLeft, Calendar, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './press.module.css';
import { PressRelease } from '@prisma/client';

interface Props {
    initialReleases: PressRelease[];
}

export default function PressClientManager({ initialReleases }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PressRelease | null>(null);
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [category, setCategory] = useState('Company News');
    const [link, setLink] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const openModal = (item?: PressRelease) => {
        if (item) {
            setEditingItem(item);
            setTitle(item.title);
            setSummary(item.summary);
            setCategory(item.category);
            setLink(item.link || '');
            setDate(new Date(item.date).toISOString().split('T')[0]);
        } else {
            setEditingItem(null);
            setTitle(''); setSummary(''); setCategory('Company News'); setLink('');
            setDate(new Date().toISOString().split('T')[0]);
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this press release?")) return;
        setLoading(true);
        const res = await deletePressRelease(id);
        if (res.success) { toast.success("Deleted"); router.refresh(); }
        else { toast.error(res.message); }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append("title", title);
        formData.append("summary", summary);
        formData.append("category", category);
        formData.append("link", link);
        formData.append("date", date);

        const res = editingItem
            ? await updatePressRelease(editingItem.id, formData)
            : await createPressRelease(formData);

        if (res.success) {
            toast.success(res.message);
            setIsModalOpen(false);
            router.refresh();
        } else {
            toast.error(res.message);
        }
        setLoading(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.backLinkContainer}>
            <Link href="/admin/settings" className={styles.backLink}>
                <ArrowLeft size={18} /> Back to Settings
            </Link>
            </div>
            <div className={styles.header}>
                <h1 className={styles.title}>Press Releases</h1>
                <button onClick={() => openModal()} className={styles.addBtn}>
                    <Plus size={18} /> Add News
                </button>
            </div>

            <div className={styles.list}>
                {initialReleases.map((item) => (
                    <div key={item.id} className={styles.card}>
                        <div className={styles.cardContent}>
                            <div className={styles.metaRow}>
                                <span className={styles.badge}>{item.category}</span>
                                <span className={styles.date}><Calendar size={12} /> {new Date(item.date).toLocaleDateString()}</span>
                            </div>
                            <h3 className={styles.cardTitle}>{item.title}</h3>
                            <p className={styles.cardSummary}>{item.summary}</p>
                            {item.link && <a href={item.link} target="_blank" className={styles.link}><ExternalLink size={12} /> External Link</a>}
                        </div>
                        <div className={styles.actions}>
                            <button onClick={() => openModal(item)} className={`${styles.iconBtn} ${styles.iconBtnEdit}`}><Pencil size={20} /></button>
                            <button onClick={() => handleDelete(item.id)} className={`${styles.iconBtn} ${styles.iconBtnDelete}`}><Trash2 size={20} /></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>{editingItem ? 'Edit Release' : 'Publish News'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className={styles.closeModalBtn}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Title</label>
                                <textarea value={title} onChange={e => setTitle(e.target.value)} required className={styles.textarea} />
                            </div>
                            <div className={styles.grid2}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Date</label>
                                    <input type="date" value={date} onChange={e => setDate(e.target.value)} required className={styles.input} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Category</label>
                                    <select value={category} onChange={e => setCategory(e.target.value)} className={styles.select}>
                                        <option>Company News</option>
                                        <option>Product Launch</option>
                                        <option>Awards</option>
                                        <option>Community</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Summary</label>
                                <textarea value={summary} onChange={e => setSummary(e.target.value)} required className={styles.textarea} />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>External Link (Optional)</label>
                                <input value={link} onChange={e => setLink(e.target.value)} className={styles.input} placeholder="https://..." />
                            </div>
                            <button disabled={loading} className={styles.submitBtn}>
                                {loading ? <Loader2 className={styles.spin} /> : "Save Release"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}