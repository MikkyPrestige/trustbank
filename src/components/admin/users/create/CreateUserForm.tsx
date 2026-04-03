'use client';

import { adminCreateUser } from '@/actions/admin/users';
import styles from './create-user.module.css';
import { Save, User, Mail, Lock, Phone, MapPin, Globe, Briefcase, Calendar, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function CreateUserForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);

        try {
            const result = await adminCreateUser(formData);

            if (result.success) {
                toast.success(result.message);
                setTimeout(() => router.push('/admin/users'), 1500);
            } else {
                toast.error(result.message || "Failed to create user");
            }
        } catch (err) {
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.card}>
            <form action={handleSubmit} className={styles.form}>
                <h3 className={styles.sectionTitle}>Login Credentials</h3>
                <div className={styles.grid}>
                    <div className={styles.formGroup}>
                        <label>Full Name <span className={styles.req}>*</span></label>
                        <div className={styles.inputWrapper}>
                            <User size={18} className={styles.icon} />
                            <input name="fullName" type="text" placeholder="e.g. John Doe" className={styles.input} required />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Email Address <span className={styles.req}>*</span></label>
                        <div className={styles.inputWrapper}>
                            <Mail size={18} className={styles.icon} />
                            <input name="email" type="email" placeholder="john@example.com" className={styles.input} required />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Initial Password <span className={styles.req}>*</span></label>
                        <div className={styles.inputWrapper}>
                            <Lock size={18} className={styles.icon} />
                            <input name="password" type="password" placeholder="••••••••" minLength={6} className={styles.input} required />
                        </div>
                    </div>
                </div>

                <hr className={styles.divider} />

                <h3 className={styles.sectionTitle}>Identity Details</h3>
                <div className={styles.grid}>
                    <div className={styles.formGroup}>
                        <label>Date of Birth <span className={styles.req}>*</span></label>
                        <div className={styles.inputWrapper}>
                            <Calendar size={18} className={styles.icon} />
                            <input
                                name="dateOfBirth"
                                type="date"
                                className={styles.input}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Gender <span className={styles.req}>*</span></label>
                        <div className={styles.inputWrapper}>
                            <Users size={18} className={styles.icon} />
                            <select name="gender" className={styles.input} required defaultValue="">
                                <option value="" disabled>Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Non-Binary">Non-Binary</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Tax ID / SSN</label>
                        <div className={styles.inputWrapper}>
                            <input name="taxId" placeholder="XXX-XX-XXXX" className={styles.inputPadded} />
                        </div>
                    </div>
                </div>

                    <hr className={styles.divider} />

                    <h3 className={styles.sectionTitle}>Contact & Work (Optional)</h3>
                    <div className={styles.grid}>
                        <div className={styles.formGroup}>
                            <label>Phone Number</label>
                            <div className={styles.inputWrapper}>
                                <Phone size={18} className={styles.icon} />
                                <input name="phone" type="text" placeholder="+1 (555) 000-0000" className={styles.input} />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Occupation</label>
                            <div className={styles.inputWrapper}>
                                <Briefcase size={18} className={styles.icon} />
                                <input name="occupation" type="text" placeholder="Software Engineer" className={styles.input} />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Street Address</label>
                            <div className={styles.inputWrapper}>
                                <MapPin size={18} className={styles.icon} />
                                <input name="address" type="text" placeholder="123 Main St" className={styles.input} />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>City</label>
                            <div className={styles.inputWrapper}>
                                <input name="city" type="text" placeholder="New York" className={styles.inputPadded} />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Country</label>
                            <div className={styles.inputWrapper}>
                                <Globe size={18} className={styles.icon} />
                                <input name="country" type="text" placeholder="United States" className={styles.input} />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Zip Code</label>
                            <div className={styles.inputWrapper}>
                                <input name="zipCode" type="text" placeholder="10001" className={styles.inputPadded} />
                            </div>
                        </div>

                    </div>

                    <div className={styles.actions}>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            <Save size={18} /> {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </div>
            </form>
        </div>
    );
}