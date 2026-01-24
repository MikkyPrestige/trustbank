'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createJob, updateJob, deleteJob, toggleJobStatus } from '@/actions/admin/jobs';
import { Plus, Pencil, Trash2, X, Loader2, MapPin, Briefcase, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './jobs.module.css';
import { JobListing } from '@prisma/client';

interface Props {
    initialJobs: JobListing[];
}

export default function JobClientManager({ initialJobs }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<JobListing | null>(null);

    // Form
    const [title, setTitle] = useState('');
    const [department, setDepartment] = useState('');
    const [location, setLocation] = useState('');
    const [type, setType] = useState('Full-time');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);

    const openAddModal = () => {
        setEditingItem(null);
        setTitle('');
        setDepartment('');
        setLocation('');
        setType('Full-time');
        setDescription('');
        setIsActive(true);
        setIsModalOpen(true);
    };

    const openEditModal = (job: JobListing) => {
        setEditingItem(job);
        setTitle(job.title);
        setDepartment(job.department);
        setLocation(job.location);
        setType(job.type);
        setDescription(job.description);
        setIsActive(job.isActive);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this job listing?")) return;
        setLoading(true);
        const res = await deleteJob(id);
        if (res.success) {
            toast.success(res.message);
            router.refresh();
        } else {
            toast.error(res.message);
        }
        setLoading(false);
    };

    const handleToggleStatus = async (job: JobListing) => {
        setLoading(true);
        const res = await toggleJobStatus(job.id, job.isActive);
        if (res.success) {
            toast.success(`Job ${job.isActive ? 'Closed' : 'Activated'}`);
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
        formData.append("department", department);
        formData.append("location", location);
        formData.append("type", type);
        formData.append("description", description);
        if (isActive) formData.append("isActive", "on");

        const res = editingItem
            ? await updateJob(editingItem.id, formData)
            : await createJob(formData);

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
            <div className={styles.header}>
                <h1 className={styles.title}>Job Openings</h1>
                <button onClick={openAddModal} className={styles.addBtn} disabled={loading}>
                    <Plus size={18} /> Post Job
                </button>
            </div>

            <div className={styles.list}>
                {initialJobs.length === 0 ? (
                    <p className={styles.emptyState}>No active job listings.</p>
                ) : (
                    initialJobs.map((job) => (
                        <div key={job.id} className={styles.card}>
                            <div>
                                <div className={styles.cardHeader}>
                                    <h3 className={styles.jobTitle}>{job.title}</h3>
                                    <span className={`${styles.statusBadge} ${job.isActive ? styles.active : styles.closed}`}>
                                        {job.isActive ? 'Active' : 'Closed'}
                                    </span>
                                    <span className={styles.typeBadge}>{job.type}</span>
                                </div>
                                <div className={styles.metaRow}>
                                    <span className={styles.metaItem}><Building size={14} /> {job.department}</span>
                                    <span className={styles.metaItem}><MapPin size={14} /> {job.location}</span>
                                </div>
                            </div>
                            <div className={styles.actions}>
                                <button
                                    onClick={() => handleToggleStatus(job)}
                                    className={styles.iconBtn}
                                    title={job.isActive ? "Close Job" : "Activate Job"}
                                    disabled={loading}
                                >
                                    {job.isActive ? <X size={16} color="#ef4444" /> : <Plus size={16} color="#22c55e" />}
                                </button>
                                <button onClick={() => openEditModal(job)} className={styles.iconBtn} disabled={loading}>
                                    <Pencil size={16} />
                                </button>
                                <button onClick={() => handleDelete(job.id)} className={`${styles.iconBtn} ${styles.deleteBtn}`} disabled={loading}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>{editingItem ? 'Edit Job' : 'Post New Job'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className={styles.closeModalBtn}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Job Title</label>
                                    <input className={styles.input} value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Senior Analyst" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Department</label>
                                    <input className={styles.input} value={department} onChange={e => setDepartment(e.target.value)} required placeholder="e.g. Finance" />
                                </div>
                            </div>

                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Location</label>
                                    <input className={styles.input} value={location} onChange={e => setLocation(e.target.value)} required placeholder="e.g. New York / Remote" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Employment Type</label>
                                    <select className={styles.select} value={type} onChange={e => setType(e.target.value)}>
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Internship">Internship</option>
                                    </select>
                                </div>
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Description</label>
                                <textarea className={styles.textarea} value={description} onChange={e => setDescription(e.target.value)} required placeholder="Job details..." />
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.checkboxWrapper}>
                                    <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className={styles.checkbox} />
                                    <span>List this job publicly</span>
                                </label>
                            </div>

                            <button type="submit" className={styles.submitBtn} disabled={loading}>
                                {loading ? <Loader2 className={styles.spin} /> : (editingItem ? 'Update Job' : 'Post Job')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}