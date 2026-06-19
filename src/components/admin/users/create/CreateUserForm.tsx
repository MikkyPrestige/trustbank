'use client';

import { adminCreateUser } from '@/actions/admin/users';
import styles from './create-user.module.css';
import { Save, User, Mail, Lock, Phone, MapPin, Globe, Briefcase, Calendar, Users, Upload, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import toast from 'react-hot-toast';

export default function CreateUserForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [passportFile, setPassportFile] = useState<File | null>(null);
    const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
    const [idBackFile, setIdBackFile] = useState<File | null>(null);
    const passportRef = useRef<HTMLInputElement>(null);
    const idFrontRef = useRef<HTMLInputElement>(null);
    const idBackRef = useRef<HTMLInputElement>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);

        // Attach KYC files if selected
        if (passportFile) formData.append("passport", passportFile);
        if (idFrontFile) formData.append("idCardFront", idFrontFile);
        if (idBackFile) formData.append("idCardBack", idBackFile);

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

                    <hr className={styles.divider} />

                    <h3 className={styles.sectionTitle}>
                        <ShieldCheck size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                        KYC Documents <span style={{ fontWeight: 400, fontSize: '0.85rem', color: 'var(--text-muted)' }}>(Optional — user will be verified immediately)</span>
                    </h3>
                    <div className={styles.grid}>
                        <div className={styles.formGroup}>
                            <label>Passport Photo</label>
                            <button type="button" className={styles.filePickBtn} onClick={() => passportRef.current?.click()}>
                                <Upload size={14} />
                                {passportFile ? passportFile.name : 'Choose file'}
                            </button>
                            <input ref={passportRef} type="file" accept="image/*" hidden onChange={(e) => setPassportFile(e.target.files?.[0] || null)} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>ID Card – Front</label>
                            <button type="button" className={styles.filePickBtn} onClick={() => idFrontRef.current?.click()}>
                                <Upload size={14} />
                                {idFrontFile ? idFrontFile.name : 'Choose file'}
                            </button>
                            <input ref={idFrontRef} type="file" accept="image/*" hidden onChange={(e) => setIdFrontFile(e.target.files?.[0] || null)} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>ID Card – Back</label>
                            <button type="button" className={styles.filePickBtn} onClick={() => idBackRef.current?.click()}>
                                <Upload size={14} />
                                {idBackFile ? idBackFile.name : 'Choose file'}
                            </button>
                            <input ref={idBackRef} type="file" accept="image/*" hidden onChange={(e) => setIdBackFile(e.target.files?.[0] || null)} />
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