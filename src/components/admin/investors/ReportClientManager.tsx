'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// Import the updateReport action you just created
import { createReport, deleteReport, updateReport } from '@/actions/admin/reports';
import { Plus, Trash2, X, Loader2, FileText, ArrowLeft, Link as LinkIcon, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './reports.module.css';
import { FinancialReport } from '@prisma/client';

interface Props {
    initialReports: FinancialReport[];
}

export default function ReportClientManager({ initialReports }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form States
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [fileUrl, setFileUrl] = useState('');
    const [type, setType] = useState('PDF');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Handle opening modal for a new report
    const openAddModal = () => {
        setEditingId(null);
        setTitle('');
        setSummary('');
        setFileUrl('');
        setType('PDF');
        setDate(new Date().toISOString().split('T')[0]);
        setIsModalOpen(true);
    };

    // Handle opening modal for editing
    const startEdit = (report: FinancialReport) => {
        setEditingId(report.id);
        setTitle(report.title);
        setSummary(report.summary || '');
        setFileUrl(report.fileUrl);
        setType(report.type);
        setDate(new Date(report.date).toISOString().split('T')[0]);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this report?")) return;
        setLoading(true);
        const res = await deleteReport(id);
        if (res.success) {
            toast.success("Deleted");
            router.refresh();
        } else {
            toast.error(res.message);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("title", title);
        formData.append("summary", summary);
        formData.append("fileUrl", fileUrl);
        formData.append("type", type);
        formData.append("date", date);

        // Switch between Create and Update actions
        const res = editingId
            ? await updateReport(editingId, formData)
            : await createReport(formData);

        if (res.success) {
            toast.success(res.message);
            setIsModalOpen(false);
            router.refresh();
            // Reset form
            setEditingId(null);
            setTitle(''); setSummary(''); setFileUrl('');
        } else {
            toast.error(res.message);
        }
        setLoading(false);
    };

    return (
        <div className={styles.container}>
            <Link href="/admin/settings" className={styles.backLink}>
                <ArrowLeft size={18} /> Back to Settings
            </Link>

            <div className={styles.header}>
                <h1 className={styles.title}>Financial Reports</h1>
                <button onClick={openAddModal} className={styles.addBtn}>
                    <Plus size={18} /> Add Report
                </button>
            </div>

            <div className={styles.list}>
                {initialReports.map((report) => (
                    <div key={report.id} className={styles.card}>
                        <div className={styles.cardContent}>
                            <div className={styles.iconBox}>
                                {report.type === 'PDF' ? <FileText /> : <LinkIcon />}
                            </div>
                            <div>
                                <h3 className={styles.cardTitle}>{report.title}</h3>
                                <p className={styles.cardDate}>{new Date(report.date).toLocaleDateString()}</p>
                                <a href={report.fileUrl} target="_blank" className={styles.link} rel="noreferrer">{report.fileUrl}</a>
                            </div>
                        </div>
                        <div className={styles.actions}>
                            <button onClick={() => startEdit(report)} className={styles.editBtn}>
                                <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(report.id)} className={styles.deleteBtn}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2>{editingId ? "Edit Report" : "Publish Report"}</h2>
                            <button onClick={() => setIsModalOpen(false)}><X /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label>Report Title</label>
                                <input value={title} onChange={e => setTitle(e.target.value)} required className={styles.input} placeholder="e.g. Q4 2024 Earnings" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Date</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} required className={styles.input} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Type</label>
                                <select value={type} onChange={e => setType(e.target.value)} className={styles.input}>
                                    <option value="PDF">PDF Document</option>
                                    <option value="LINK">External Link</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>File URL (or Link)</label>
                                <input value={fileUrl} onChange={e => setFileUrl(e.target.value)} required className={styles.input} placeholder="https://..." />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Summary (Optional)</label>
                                <textarea value={summary} onChange={e => setSummary(e.target.value)} className={styles.textarea} />
                            </div>

                            <button disabled={loading} className={styles.submitBtn}>
                                {loading ? <Loader2 className={styles.spin} /> : (editingId ? "Update Report" : "Publish Report")}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}