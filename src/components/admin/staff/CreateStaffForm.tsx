'use client';

import { createStaffAccount } from "@/actions/admin/staff";
import styles from "./staff.module.css";
import { useState, useRef } from "react";
import { UserPlus, Mail, Lock, User } from "lucide-react";
import toast from "react-hot-toast";

export default function CreateStaffForm() {
    const [loading, setLoading] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);

        try {
            const res = await createStaffAccount(formData);

            if (res.success) {
                toast.success(res.message);
                formRef.current?.reset();
                // Optional: Force refresh if you want instant list update without page reload
                window.location.reload();
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Failed to create staff account");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.formCard}>
            <h3 className={styles.formTitle}>
                <UserPlus size={20} className={styles.icon} />
                Recruit New Staff
            </h3>

            <form ref={formRef} action={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Full Name</label>
                    <div className={styles.inputWrapper}>
                        <User size={16} className={styles.inputIcon} />
                        <input name="fullName" className={styles.input} required placeholder="Jane Doe" />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Email Address</label>
                    <div className={styles.inputWrapper}>
                        <Mail size={16} className={styles.inputIcon} />
                        <input name="email" type="email" className={styles.input} required placeholder="admin@bank.com" />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Password</label>
                    <div className={styles.inputWrapper}>
                        <Lock size={16} className={styles.inputIcon} />
                        <input name="password" type="password" className={styles.input} required placeholder="••••••••" minLength={6} />
                    </div>
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