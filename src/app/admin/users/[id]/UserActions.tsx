'use client';

import { useState } from 'react';
import { toggleUserStatus, deleteUser } from "@/actions/admin-users";
import { Shield, Ban, Trash2 } from "lucide-react";
import styles from "../users.module.css";
import { useRouter } from 'next/navigation';

export default function UserActions({ userId, status }: { userId: string, status: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleToggle = async () => {
        setLoading(true);
        // We cast the status string to the specific Enum type if needed, or let the action handle it
        await toggleUserStatus(userId, status as "ACTIVE" | "SUSPENDED");
        setLoading(false);
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to PERMANENTLY delete this user? This cannot be undone.")) return;

        setLoading(true);
        await deleteUser(userId);
        // Redirect is handled in the server action, but we can also push here to be safe
        router.push('/admin/users');
    };

    return (
        <div className={styles.actions}>
            <button
                onClick={handleToggle}
                disabled={loading}
                className={`${styles.actionBtn} ${status === 'ACTIVE' ? styles.freeze : styles.unfreeze}`}
            >
                {status === 'ACTIVE' ? (
                    <><Ban size={16} /> Freeze Account</>
                ) : (
                    <><Shield size={16} /> Activate Account</>
                )}
            </button>

            <button
                onClick={handleDelete}
                disabled={loading}
                className={`${styles.actionBtn} ${styles.delete}`}
            >
                <Trash2 size={16} /> Delete
            </button>
        </div>
    );
}