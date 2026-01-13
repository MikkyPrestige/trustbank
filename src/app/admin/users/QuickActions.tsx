'use client';

import { useState } from 'react';
import { toggleUserStatus } from '@/actions/admin/users';
import { MoreHorizontal, Ban, CheckCircle, Lock } from 'lucide-react';
import styles from './users.module.css';

export default function QuickActions({ userId, currentStatus }: { userId: string, currentStatus: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleStatusChange = async (newStatus: string) => {
        if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;

        setLoading(true);
        setIsOpen(false); // Close menu
        await toggleUserStatus(userId, newStatus);
        setLoading(false);
    };

    return (
        <div className={styles.actionDropdown} onMouseLeave={() => setIsOpen(false)}>
            <button
                className={styles.iconBtn}
                onClick={() => setIsOpen(!isOpen)}
                disabled={loading}
            >
                {loading ? <div className={styles.spinner} /> : <MoreHorizontal size={16} />}
            </button>

            {isOpen && (
                <div className={styles.dropdownMenu}>
                    {currentStatus !== 'ACTIVE' && (
                        <button onClick={() => handleStatusChange('ACTIVE')} className={styles.menuItem}>
                            <CheckCircle size={14} color="#22c55e" /> Activate
                        </button>
                    )}

                    {currentStatus !== 'SUSPENDED' && (
                        <button onClick={() => handleStatusChange('SUSPENDED')} className={styles.menuItem}>
                            <Ban size={14} color="#ef4444" /> Suspend
                        </button>
                    )}

                    {currentStatus !== 'FROZEN' && (
                        <button onClick={() => handleStatusChange('FROZEN')} className={styles.menuItem}>
                            <Lock size={14} color="#3b82f6" /> Freeze
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}