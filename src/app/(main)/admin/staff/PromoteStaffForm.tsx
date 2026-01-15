'use client';

import { promoteUserToStaff } from "@/actions/admin/staff";
import styles from "./staff.module.css";
import { useState } from "react";
import { ArrowUpCircle, Search } from "lucide-react";

export default function PromoteStaffForm() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setMessage(null);

        const res = await promoteUserToStaff(formData);

        if (res.success) {
            setMessage({ text: res.message, type: 'success' });
            const form = document.getElementById("promote-staff-form") as HTMLFormElement;
            form?.reset();
        } else {
            setMessage({ text: res.message, type: 'error' });
        }
        setLoading(false);
    }

    return (
        // Combine base formCard class with specific promoteCard styles
        <div className={`${styles.formCard} ${styles.promoteCard}`}>
            <h3 className={`${styles.formTitle} ${styles.promoteTitle}`}>
                <ArrowUpCircle size={20} className={styles.headerIcon} />
                Promote Existing User
            </h3>

            <form id="promote-staff-form" action={handleSubmit}>
                {message && (
                    <div className={`${styles.alert} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}

                <div className={styles.formGroup}>
                    <label className={styles.label}>User Email</label>
                    <div className={styles.inputWrapper}>
                        <Search size={16} className={styles.searchIcon} />
                        <input
                            name="email"
                            type="email"
                            className={`${styles.input} ${styles.inputWithIcon}`}
                            required
                            placeholder="client@email.com"
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>New Role</label>
                    <select name="role" className={styles.select}>
                        <option value="ADMIN">Admin (Moderator)</option>
                        <option value="SUPPORT">Support Agent</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className={`${styles.submitBtn} ${styles.promoteBtn}`}
                    disabled={loading}
                >
                    {loading ? "Updating..." : "Promote User"}
                </button>
            </form>
        </div>
    );
}