'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBranch, updateBranch, deleteBranch, toggleBranchStatus } from '@/actions/admin/branches';
import { Plus, Pencil, Trash2, X, Loader2, MapPin, Phone, Building, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './branches.module.css';
import { Branch } from '@prisma/client';

interface Props {
    initialBranches: Branch[];
}

export default function BranchClientManager({ initialBranches }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Branch | null>(null);

    // Form
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [isActive, setIsActive] = useState(true);

    const openAddModal = () => {
        setEditingItem(null);
        setName('');
        setAddress('');
        setCity('');
        setPhone('');
        setEmail('');
        setIsActive(true);
        setIsModalOpen(true);
    };

    const openEditModal = (branch: Branch) => {
        setEditingItem(branch);
        setName(branch.name);
        setAddress(branch.address);
        setCity(branch.city);
        setPhone(branch.phone);
        setEmail(branch.email || '');
        setIsActive(branch.isActive);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this branch?")) return;
        setLoading(true);
        const res = await deleteBranch(id);
        if (res.success) {
            toast.success(res.message);
            router.refresh();
        } else {
            toast.error(res.message);
        }
        setLoading(false);
    };

    const handleToggleStatus = async (branch: Branch) => {
        setLoading(true);
        const res = await toggleBranchStatus(branch.id, branch.isActive);
        if (res.success) {
            toast.success(`Branch ${branch.isActive ? 'Closed' : 'Activated'}`);
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
        formData.append("name", name);
        formData.append("address", address);
        formData.append("city", city);
        formData.append("phone", phone);
        formData.append("email", email);
        if (isActive) formData.append("isActive", "on");

        const res = editingItem
            ? await updateBranch(editingItem.id, formData)
            : await createBranch(formData);

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
                <h1 className={styles.title}>Branch Locations</h1>
                <button onClick={openAddModal} className={styles.addBtn} disabled={loading}>
                    <Plus size={18} /> Add Branch
                </button>
            </div>

            <div className={styles.list}>
                {initialBranches.length === 0 ? (
                    <p className={styles.emptyState}>No branches added yet.</p>
                ) : (
                    initialBranches.map((branch) => (
                        <div key={branch.id} className={styles.card}>
                            <div>
                                <div className={styles.cardHeader}>
                                    <h3 className={styles.branchName}>{branch.name}</h3>
                                    <span className={`${styles.statusBadge} ${branch.isActive ? styles.active : styles.closed}`}>
                                        {branch.isActive ? 'Open' : 'Closed'}
                                    </span>
                                </div>
                                <div className={styles.metaRow}>
                                    <span className={styles.metaItem}><MapPin size={14} /> {branch.city}</span>
                                    <span className={styles.metaItem}><Phone size={14} /> {branch.phone}</span>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                                    {branch.address}
                                </div>
                            </div>
                            <div className={styles.actions}>
                                <button
                                    onClick={() => handleToggleStatus(branch)}
                                    className={styles.iconBtn}
                                    title={branch.isActive ? "Mark Closed" : "Mark Open"}
                                    disabled={loading}
                                >
                                    {branch.isActive ? <X size={16} color="#ef4444" /> : <Plus size={16} color="#22c55e" />}
                                </button>
                                <button onClick={() => openEditModal(branch)} className={styles.iconBtn} disabled={loading}>
                                    <Pencil size={16} />
                                </button>
                                <button onClick={() => handleDelete(branch.id)} className={`${styles.iconBtn} ${styles.deleteBtn}`} disabled={loading}>
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
                            <h2 className={styles.modalTitle}>{editingItem ? 'Edit Branch' : 'Add New Branch'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className={styles.closeModalBtn}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Branch Name</label>
                                <input className={styles.input} value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Downtown HQ" />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Address</label>
                                <input className={styles.input} value={address} onChange={e => setAddress(e.target.value)} required placeholder="123 Finance St, Suite 100" />
                            </div>

                            <div className={styles.grid2}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>City</label>
                                    <input className={styles.input} value={city} onChange={e => setCity(e.target.value)} required placeholder="New York" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Phone</label>
                                    <input className={styles.input} value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+1 (555)..." />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Contact Email</label>
                                <input type="email" className={styles.input} value={email} onChange={e => setEmail(e.target.value)} placeholder="branch@trustbank.com" />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.checkboxWrapper}>
                                    <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className={styles.checkbox} />
                                    <span>Branch is currently open for business</span>
                                </label>
                            </div>

                            <button type="submit" className={styles.submitBtn} disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : (editingItem ? 'Update Branch' : 'Add Branch')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}