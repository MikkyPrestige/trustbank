'use client';

import { useState } from 'react';
import { toggleUserStatus, deleteUser } from "@/actions/admin/users";
import {
    Trash2,
    KeyRound,
    ChevronDown,
    CheckCircle,
    Lock,
    Ban
} from "lucide-react";
import { useRouter } from 'next/navigation';
import styles from "../users.module.css";
import ResetPasswordModal from '@/components/admin/ResetPasswordModal';

export default function UserActions({ userId, status }: { userId: string, status: string }) {
    const [loading, setLoading] = useState(false);
    const [showReset, setShowReset] = useState(false);
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const router = useRouter();

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === status) return; // No change
        if (!confirm(`Change user status to ${newStatus}?`)) return;

        setLoading(true);
        setShowStatusMenu(false);
        await toggleUserStatus(userId, newStatus);
        setLoading(false);
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to PERMANENTLY delete this user? This cannot be undone.")) return;
        setLoading(true);
        await deleteUser(userId);
        router.push('/admin/users');
    };

    return (
        <>
            <div className={styles.actions}>
                {/* 1. RESET PASSWORD */}
                <button
                    onClick={() => setShowReset(true)}
                    disabled={loading}
                    className={`${styles.actionBtn} ${styles.reset}`}
                    title="Reset Password"
                >
                    <KeyRound size={16} /> <span className={styles.btnText}>Reset Pass</span>
                </button>

                {/* 2. STATUS DROPDOWN (Replaces the broken Toggle) */}
                <div className={styles.dropdownWrapper}>
                    <button
                        onClick={() => setShowStatusMenu(!showStatusMenu)}
                        disabled={loading}
                        className={`${styles.actionBtn} ${styles.statusBtn}`}
                    >
                        {status === 'ACTIVE' && <CheckCircle size={16} color="#22c55e" />}
                        {status === 'FROZEN' && <Lock size={16} color="#3b82f6" />}
                        {status === 'SUSPENDED' && <Ban size={16} color="#ef4444" />}
                        <span>{status}</span>
                        <ChevronDown size={14} style={{ opacity: 0.5 }} />
                    </button>

                    {showStatusMenu && (
                        <div className={styles.statusMenu}>
                            <button onClick={() => handleStatusChange('ACTIVE')} className={styles.statusItem}>
                                <CheckCircle size={14} color="#22c55e" /> Activate
                            </button>
                            <button onClick={() => handleStatusChange('FROZEN')} className={styles.statusItem}>
                                <Lock size={14} color="#3b82f6" /> Freeze
                            </button>
                            <button onClick={() => handleStatusChange('SUSPENDED')} className={styles.statusItem}>
                                <Ban size={14} color="#ef4444" /> Suspend
                            </button>
                        </div>
                    )}
                </div>

                {/* 3. DELETE */}
                <button
                    onClick={handleDelete}
                    disabled={loading}
                    className={`${styles.actionBtn} ${styles.delete}`}
                    title="Delete User"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {/* MODAL */}
            {showReset && (
                <ResetPasswordModal
                    userId={userId}
                    onClose={() => setShowReset(false)}
                />
            )}

            {/* Click outside listener could be added here, or just use a simple onMouseLeave on the wrapper */}
            {showStatusMenu && (
                <div
                    style={{ position: 'fixed', inset: 0, zIndex: 10 }}
                    onClick={() => setShowStatusMenu(false)}
                />
            )}
        </>
    );
}