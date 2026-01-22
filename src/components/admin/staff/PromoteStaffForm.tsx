'use client';

import { promoteUserToStaff } from "@/actions/admin/staff";
import styles from "./staff.module.css";
import { useState, useRef } from "react";
import { ArrowUpCircle, Search } from "lucide-react";
import toast from "react-hot-toast";

export default function PromoteStaffForm() {
    const [loading, setLoading] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);

        try {
            const res = await promoteUserToStaff(formData);

            if (res.success) {
                toast.success(res.message);
                formRef.current?.reset();
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Failed to promote user");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={`${styles.formCard} ${styles.promoteCard}`}>
            <h3 className={`${styles.formTitle} ${styles.promoteTitle}`}>
                <ArrowUpCircle size={20} className={styles.icon} />
                Promote Existing User
            </h3>

            <form ref={formRef} action={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>User Email</label>
                    <div className={styles.inputWrapper}>
                        <Search size={16} className={styles.inputIcon} />
                        <input
                            name="email"
                            type="email"
                            className={styles.input}
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