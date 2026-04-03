'use client';

import { useState } from 'react';
import { toggleUserStatus, deleteUser, unlockUserSecurity } from "@/actions/admin/users";
import {
    Trash2,
    KeyRound,
    ChevronDown,
    CheckCircle,
    Lock,
    Unlock,
    Ban,
    Loader2
} from "lucide-react";
import { useRouter } from 'next/navigation';
import styles from "./users.module.css";
import ResetPasswordModal from '@/components/admin/auth/ResetPasswordModal';
import { UserStatus } from '@prisma/client';
import toast from 'react-hot-toast';

interface UserActionsProps {
    userId: string;
    status: UserStatus;
    siteName?: string;
    isLocked?: boolean;
}

export default function UserActions({ userId, status, siteName = "TrustBank", isLocked }: UserActionsProps) {
    const [loading, setLoading] = useState(false);
    const [showReset, setShowReset] = useState(false);
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const router = useRouter();

    const handleStatusChange = async (newStatus: UserStatus) => {
        if (newStatus === status) return;
        if (!confirm(`Change user status to ${newStatus}?`)) return;

        setLoading(true);
        setShowStatusMenu(false);

        try {
            const res = await toggleUserStatus(userId, newStatus);
            if (res.success) {
                toast.success(res.message);
                router.refresh();
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("WARNING: Are you sure you want to delete this user?")) return;

        setLoading(true);
        try {
            const res = await deleteUser(userId);
            if (res.success) {
                toast.success("User deleted successfully");
                router.push('/admin/users');
            } else {
                toast.error(res.message);
                setLoading(false);
            }
        } catch (error) {
            toast.error("Failed to delete user");
            setLoading(false);
        }
    };

    const handleUnlock = async () => {
        setLoading(true);
        try {
            const res = await unlockUserSecurity(userId);
            if (res.success) {
                toast.success(res.message);
                router.refresh();
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Failed to unlock user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className={styles.actions}>
                {isLocked && (
                    <button
                        onClick={handleUnlock}
                        disabled={loading}
                        className={`${styles.actionBtn} ${styles.unlockBtn}`}
                        title="Unlock PIN/PASS"
                    >
                        {loading ? <Loader2 className={styles.spin} size={16} /> : <Unlock size={16} />}
                        <span className={styles.btnText}>Unlock PIN/PASS</span>
                    </button>
                )}

                <button
                    onClick={() => setShowReset(true)}
                    disabled={loading}
                    className={`${styles.actionBtn} ${styles.resetBtn}`}
                    title="Reset Password"
                >
                    <KeyRound size={16} /> <span className={styles.btnText}>Reset Pass</span>
                </button>

                <div className={styles.dropdownWrapper}>
                    <button
                        onClick={() => setShowStatusMenu(!showStatusMenu)}
                        disabled={loading}
                        className={`${styles.actionBtn} ${styles.statusBtn}`}
                    >
                        <div className={styles.statusContent}>
                            {loading ? <Loader2 className={styles.spin} size={16} /> : (
                                <>
                                    {status === 'ACTIVE' && <CheckCircle size={16} className={styles.activeIcon} />}
                                    {status === 'FROZEN' && <Lock size={16} className={styles.frozenIcon} />}
                                    {status === 'SUSPENDED' && <Ban size={16} className={styles.suspendedIcon} />}
                                    {status === 'PENDING_VERIFICATION' && <Lock size={16} className={styles.pendingIcon} />}
                                </>
                            )}
                            <span>{status.replace('_', ' ')}</span>
                        </div>
                        <ChevronDown size={16} className={styles.chevron} />
                    </button>

                    {showStatusMenu && (
                        <div className={styles.statusMenu}>
                            <button onClick={() => handleStatusChange('ACTIVE')} className={styles.menuItem}>
                                <CheckCircle size={16} className={styles.activeIcon} /> Activate
                            </button>
                            <button onClick={() => handleStatusChange('FROZEN')} className={styles.menuItem}>
                                <Lock size={16} className={styles.frozenIcon} /> Freeze
                            </button>
                            <button onClick={() => handleStatusChange('SUSPENDED')} className={styles.menuItem}>
                                <Ban size={16} className={styles.suspendedIcon} /> Suspend
                            </button>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleDelete}
                    disabled={loading}
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    title="Delete User"
                >
                    <Trash2 size={16} /> <span className={styles.btnText}>Delete</span>
                </button>
            </div>

            {showReset && (
                <ResetPasswordModal
                    userId={userId}
                    onClose={() => setShowReset(false)}
                    siteName={siteName}
                />
            )}

            {showStatusMenu && (
                <div className={styles.overlay} onClick={() => setShowStatusMenu(false)} />
            )}
        </>
    );
}