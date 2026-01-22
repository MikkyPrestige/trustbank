'use client';

import { removeStaffAccount } from "@/actions/admin/staff";
import styles from "./staff.module.css";
import { Trash2 } from "lucide-react";

interface StaffUser {
    id: string;
    fullName: string;
    email: string;
    role: string;
    createdAt: Date;
}

export default function StaffList({ staff }: { staff: StaffUser[] }) {

    async function handleRemove(id: string) {
        if (!confirm("Are you sure you want to revoke this user's access? They will be permanently deleted.")) return;
        await removeStaffAccount(id);
    }

    return (
        <div className={styles.listCard}>
            {staff.length === 0 ? (
                <div className={styles.empty}>No staff members found. You are the only one here!</div>
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Staff Member</th>
                            <th>Role</th>
                            <th>Date Added</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staff.map((user) => (
                            <tr key={user.id}>
                                <td>
                                    <div style={{ fontWeight: 600, color: '#fff' }}>{user.fullName}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{user.email}</div>
                                </td>
                                <td>
                                    <span className={`${styles.badge} ${styles[user.role]}`}>{user.role}</span>
                                </td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button
                                        onClick={() => handleRemove(user.id)}
                                        className={styles.deleteBtn}
                                        title="Revoke Access"
                                    >
                                        <Trash2 size={14} /> Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}