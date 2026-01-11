'use client';

import { deleteBeneficiary } from '@/actions/beneficiary';
import { Trash2, Building, Search, Send, User } from 'lucide-react';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import styles from './beneficiaries.module.css';
import toast from 'react-hot-toast'; // 👈 Import toast

export default function BeneficiaryList({ beneficiaries }: { beneficiaries: any[] }) {
    const [isPending, startTransition] = useTransition();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const handleDelete = (id: string) => {
        if (!confirm("Are you sure you want to delete this contact?")) return;

        setDeletingId(id);
        startTransition(async () => {
            try {
                // 👇 Call action and wait for result
                const result = await deleteBeneficiary(id);

                if (result?.success) {
                    toast.success(result.message);
                } else if (result?.message) {
                    toast.error(result.message);
                }
            } catch (error) {
                toast.error("Failed to delete contact.");
            } finally {
                setDeletingId(null);
            }
        });
    };

    // Filter beneficiaries locally
    const filtered = beneficiaries.filter(b =>
        b.accountName.toLowerCase().includes(search.toLowerCase()) ||
        b.bankName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            {/* Header with Search */}
            <div className={styles.columnHeader}>
                <h3 className={styles.columnTitle}>Your Contacts ({filtered.length})</h3>
                <div className={styles.searchWrapper}>
                    <Search size={16} className={styles.searchIcon} />
                    <input
                        placeholder="Search name or bank..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className={styles.emptyState}>
                    <User size={48} style={{ opacity: 0.5 }} />
                    <p>{search ? "No contacts found matching your search." : "You haven't added any beneficiaries yet."}</p>
                </div>
            ) : (
                <div className={styles.listContainer}>
                    {filtered.map((ben) => (
                        <div key={ben.id} className={styles.contactCard}>
                            <div className={styles.cardTop}>
                                <div className={styles.avatar}>
                                    {ben.accountName.charAt(0).toUpperCase()}
                                </div>
                                <div className={styles.info}>
                                    <h4>{ben.accountName}</h4>
                                    <div className={styles.bankBadge}>
                                        <Building size={10} /> {ben.bankName}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.cardDetails}>
                                <div>
                                    <span className={styles.accLabel}>ACCT NO.</span>
                                    <div className={styles.accNum}>{ben.accountNumber}</div>
                                </div>
                            </div>

                            <div className={styles.cardActions}>
                                <button
                                    onClick={() => handleDelete(ben.id)}
                                    disabled={isPending && deletingId === ben.id}
                                    className={styles.actionBtn}
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>

                                <Link href={`/dashboard/transfer?beneficiaryId=${ben.id}`} className={styles.sendBtn}>
                                    Send Money <Send size={14} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}