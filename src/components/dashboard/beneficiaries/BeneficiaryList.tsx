'use client';

import { deleteBeneficiary } from '@/actions/user/beneficiary';
import { Trash2, Building, Search, Send, User, Loader2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './beneficiaries.module.css';
import toast from 'react-hot-toast';

interface Beneficiary {
    id: string;
    accountName: string;
    bankName: string;
    accountNumber: string;
    swiftCode?: string | null;
    routingNumber?: string | null;
    image?: string | null;
}

export default function BeneficiaryList({ beneficiaries }: { beneficiaries: Beneficiary[] }) {
    const [isPending, startTransition] = useTransition();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const handleDelete = (id: string) => {
        if (!confirm("Are you sure you want to delete this contact?")) return;

        setDeletingId(id);
        startTransition(async () => {
            try {
                const result = await deleteBeneficiary(id);
                if (result?.success) {
                    toast.success(result.message);
                } else {
                    toast.error(result?.message || "Failed to delete contact.");
                }
            } catch (error) {
                toast.error("Network error. Please try again.");
            } finally {
                setDeletingId(null);
            }
        });
    };

    const filtered = beneficiaries.filter(b =>
        b.accountName.toLowerCase().includes(search.toLowerCase()) ||
        b.bankName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className={styles.columnHeader}>
                <div className={styles.searchWrapper}>
                    <Search size={16} className={styles.searchIcon} />
                    <input
                        placeholder="Search name or bank..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                <h3 className={styles.columnTitle}>Your Contacts ({filtered.length})</h3>
            </div>

            {filtered.length === 0 ? (
                <div className={styles.emptyState}>
                    <User size={48} style={{ opacity: 0.2 }} />
                    <p>{search ? "No contacts found." : "No beneficiaries saved yet."}</p>
                </div>
            ) : (
                <div className={styles.listContainer}>
                    {filtered.map((ben) => (
                        <div key={ben.id} className={styles.contactCard}>
                            <div className={styles.cardTop}>
                                <div className={styles.avatar}>
                                    {ben.image ? (
                                        <Image
                                            src={ben.image}
                                            alt={ben.accountName}
                                            width={42}
                                            height={42}
                                            className={styles.avatarImg}
                                        />
                                    ) : (
                                        ben.accountName.charAt(0).toUpperCase()
                                    )}
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
                                    <span className={styles.accLabel}>ACCOUNT NO.</span>
                                    <div className={styles.accNum}>{ben.accountNumber}</div>
                                </div>
                            </div>

                            <div className={styles.cardActions}>
                                <button
                                    onClick={() => handleDelete(ben.id)}
                                    disabled={isPending && deletingId === ben.id}
                                    className={styles.actionBtn}
                                    title="Delete Contact"
                                >
                                    {deletingId === ben.id ? <Loader2 size={16} className={styles.spin} /> : <Trash2 size={16} />}
                                </button>

                                <Link
                                    href={
                                        ben.swiftCode
                                            ? `/dashboard/wire?beneficiaryId=${ben.id}`
                                            : `/dashboard/transfer?beneficiaryId=${ben.id}`
                                    }
                                    className={styles.sendBtn}
                                >
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