'use client';

import { createStaffAccount } from "@/actions/admin/staff";
import styles from "./staff.module.css";
import { useState } from "react";
import { UserPlus, Shield, Mail, Lock } from "lucide-react";

export default function CreateStaffForm() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setMessage(null);

        const res = await createStaffAccount(formData);

        if (res.success) {
            setMessage({ text: res.message, type: 'success' });
            // Reset form manually or reload page
            const form = document.getElementById("create-staff-form") as HTMLFormElement;
            form?.reset();
        } else {
            setMessage({ text: res.message, type: 'error' });
        }
        setLoading(false);
    }

    return (
        <div className={styles.formCard}>
            <h3 className={styles.formTitle}>
                <UserPlus size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                Recruit New Staff
            </h3>

            <form id="create-staff-form" action={handleSubmit}>
                {message && (
                    <div style={{
                        padding: '10px', marginBottom: '1rem', borderRadius: '6px', fontSize: '0.9rem',
                        background: message.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                        color: message.type === 'success' ? '#22c55e' : '#ef4444',
                        border: `1px solid ${message.type === 'success' ? '#22c55e' : '#ef4444'}`
                    }}>
                        {message.text}
                    </div>
                )}

                <div className={styles.formGroup}>
                    <label className={styles.label}>Full Name</label>
                    <input name="fullName" className={styles.input} required placeholder="Jane Doe" />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Email Address</label>
                    <input name="email" type="email" className={styles.input} required placeholder="admin@bank.com" />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Password</label>
                    <input name="password" type="password" className={styles.input} required placeholder="••••••••" minLength={6} />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Role Clearance</label>
                    <select name="role" className={styles.select}>
                        <option value="ADMIN">Admin (Moderator)</option>
                        <option value="SUPPORT">Support Agent</option>
                    </select>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? "Processing..." : "Grant Access"}
                </button>
            </form>
        </div>
    );
}