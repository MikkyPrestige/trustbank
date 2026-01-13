'use client';

import { adminCreateUser } from '@/actions/admin/users';
import styles from './create-user.module.css';
import { Save, User, Mail, Lock, Phone, MapPin, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateUserForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setMessage(null);

        try {
            const result = await adminCreateUser(formData);

            if (result.success) {
                setMessage({ text: result.message, type: 'success' });
                setTimeout(() => router.push('/admin/users'), 1500);
            } else {
                setMessage({ text: result.message || "Failed to create user", type: 'error' });
            }
        } catch (err) {
            setMessage({ text: "An unexpected error occurred", type: 'error' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.card}>
            <form action={handleSubmit} className={styles.form}>

                {/* Feedback Message */}
                {message && (
                    <div className={`${styles.alert} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}

                {/* SECTION 1: ACCOUNT CREDENTIALS (REQUIRED) */}
                <h3 className={styles.sectionTitle}>Login Credentials</h3>
                <div className={styles.grid}>
                    <div className={styles.formGroup}>
                        <label>Full Name <span className={styles.req}>*</span></label>
                        <div className={styles.inputWrapper}>
                            <User size={18} className={styles.icon} />
                            <input name="fullName" type="text" placeholder="e.g. John Doe" required />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Email Address <span className={styles.req}>*</span></label>
                        <div className={styles.inputWrapper}>
                            <Mail size={18} className={styles.icon} />
                            <input name="email" type="email" placeholder="john@example.com" required />
                        </div>
                    </div>

                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                        <label>Initial Password <span className={styles.req}>*</span></label>
                        <div className={styles.inputWrapper}>
                            <Lock size={18} className={styles.icon} />
                            <input name="password" type="password" placeholder="••••••••" minLength={6} required />
                        </div>
                    </div>
                </div>

                <hr className={styles.divider} />

                {/* SECTION 2: PERSONAL DETAILS (OPTIONAL) */}
                <h3 className={styles.sectionTitle}>Personal Details (Optional)</h3>
                <div className={styles.grid}>

                    <div className={styles.formGroup}>
                        <label>Phone Number</label>
                        <div className={styles.inputWrapper}>
                            <Phone size={18} className={styles.icon} />
                            <input name="phone" type="text" placeholder="+1 (555) 000-0000" />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Street Address</label>
                        <div className={styles.inputWrapper}>
                            <MapPin size={18} className={styles.icon} />
                            <input name="address" type="text" placeholder="123 Main St" />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>City</label>
                        <div className={styles.inputWrapper}>
                            <input name="city" type="text" placeholder="New York" style={{ paddingLeft: '12px' }} />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Country</label>
                        <div className={styles.inputWrapper}>
                            <Globe size={18} className={styles.icon} />
                            <input name="country" type="text" placeholder="United States" />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Zip Code</label>
                        <div className={styles.inputWrapper}>
                            <input name="zipCode" type="text" placeholder="10001" style={{ paddingLeft: '12px' }} />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Occupation</label>
                        <div className={styles.inputWrapper}>
                            <input name="occupation" type="text" placeholder="Software Engineer" style={{ paddingLeft: '12px' }} />
                        </div>
                    </div>

                </div>

                <div className={styles.actions}>
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        <Save size={18} /> {loading ? 'Creating...' : 'Create Account'}
                    </button>
                </div>
            </form>
        </div>
    );
}