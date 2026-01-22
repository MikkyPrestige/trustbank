'use client';

import { removeStaffAccount } from "@/actions/admin/staff";
import styles from "./staff.module.css";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface StaffUser {
    id: string;
    fullName: string;
    email: string;
    role: string;
    createdAt: Date;
}

export default function StaffList({ staff }: { staff: StaffUser[] }) {
    const router = useRouter();

    async function handleRemove(id: string) {
        if (!confirm("Are you sure you want to revoke this user's access? They will be permanently deleted.")) return;

        try {
            const res = await removeStaffAccount(id);
            if (res.success) {
                toast.success("Staff account removed");
                router.refresh();
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Failed to remove staff");
        }
    }

    return (
        <div className={styles.listCard}>
            {staff.length === 0 ? (
                <div className={styles.empty}>No staff members found. You are the only one here!</div>
            ) : (
                <div className={styles.tableWrapper}>
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
                                        <div className={styles.userName}>{user.fullName}</div>
                                        <div className={styles.userEmail}>{user.email}</div>
                                    </td>
                                    <td>
                                        <span className={`${styles.badge} ${styles[user.role]}`}>{user.role}</span>
                                    </td>
                                    <td className={styles.dateCell}>{new Date(user.createdAt).toLocaleDateString()}</td>
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
                </div>
            )}
        </div>
    );
}