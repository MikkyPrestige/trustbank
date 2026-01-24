'use client';

import { useActionState, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { registerUser } from '@/actions/user/register';
import Link from 'next/link';
import {
    Lock, User, MapPin, UploadCloud, ShieldCheck,
    CheckCircle, ArrowRight, FileText, Mail, HeartHandshake, Fingerprint, Camera, AlertCircle
} from 'lucide-react';
import styles from './styles/RegisterForm.module.css';

const initialState = {
    message: '',
    errors: {},
    success: false
};

const MAX_TOTAL_SIZE = 21 * 1024 * 1024; // 21MB

interface RegisterFormProps {
    siteName?: string;
}

export default function RegisterForm({ siteName = "TrustBank" }: RegisterFormProps) {
    const [state, action, isPending] = useActionState(registerUser, initialState);
    const [fileError, setFileError] = useState<string | null>(null);

    const searchParams = useSearchParams();
    const defaultName = searchParams.get('full_name') || '';
    const defaultEmail = searchParams.get('email') || '';

    const [frontFile, setFrontFile] = useState<string | null>(null);
    const [passportFile, setPassportFile] = useState<string | null>(null);
    const [sizes, setSizes] = useState({ passport: 0, id: 0 });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const fieldName = e.target.name;

        const newSize = file ? file.size : 0;
        const currentPassportSize = fieldName === 'passportPhoto' ? newSize : sizes.passport;
        const currentIdSize = fieldName === 'idDocument' ? newSize : sizes.id;
        const totalSize = currentPassportSize + currentIdSize;

        setFileError(null);

        if (file) {
            if (totalSize > MAX_TOTAL_SIZE) {
                const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
                setFileError(`Total upload size (${sizeMB}MB) exceeds the 20MB limit.`);
                e.target.value = "";
                return;
            }
            if (fieldName === 'idDocument') {
                setFrontFile(file.name);
                setSizes(prev => ({ ...prev, id: newSize }));
            } else if (fieldName === 'passportPhoto') {
                setPassportFile(file.name);
                setSizes(prev => ({ ...prev, passport: newSize }));
            }
        }
    };

    if (state?.success) {
        return (
            <div className={styles.pageWrapper}>
                <div className={styles.successCard}>
                    <div className={styles.successIcon}><CheckCircle size={64} strokeWidth={1.5} /></div>
                    <h1>Application Received</h1>
                    <p>{state.message}</p>
                    <div className={styles.successDetails}>
                        <p>Your {siteName} digital vault is being provisioned.</p>
                        <p>Please check your secure inbox for the activation link.</p>
                    </div>
                    <Link href="/login" className={styles.primaryBtn}>
                        Return to Login <ArrowRight size={20} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.ambientMesh}></div>

            <div className={styles.formContainer}>
                <div className={styles.header}>
                    <div className={styles.brandBadge}>
                        <ShieldCheck size={16} />
                        <span>256-Bit Encrypted Protocol</span>
                    </div>
                    <h1>Secure Onboarding</h1>
                    <p>Complete your profile to access {siteName} Enterprise.</p>
                </div>

                <form action={action} className={styles.glassForm}>

                    {/* ERROR ALERTS */}
                    {(state?.message && !state.success) && (
                        <div className={styles.errorBanner}>
                            <AlertCircle size={20} />
                            <span>{state.message}</span>
                        </div>
                    )}
                    {fileError && (
                        <div className={styles.errorBanner} style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                            <AlertCircle size={20} />
                            <span>{fileError}</span>
                        </div>
                    )}

                    <div className={styles.splitLayout}>
                        {/* ================= LEFT COLUMN ================= */}
                        <div className={styles.colLeft}>

                            {/* SECTION: PROFILE PHOTO */}
                            <div className={styles.sectionLabel}>
                                <Camera size={16} /> <span>Profile Photo</span>
                            </div>
                            <div className={styles.fieldGroup}>
                                <div className={styles.photoUploadRow}>
                                    <div className={styles.previewCircle}>
                                        {passportFile ? <User size={32} color="#22c55e" /> : <User size={32} className={styles.placeholderIcon} />}
                                    </div>
                                    <div className={styles.photoInputWrapper}>
                                        <label>Upload Passport / Selfie</label>
                                        <input type="file" name="passportPhoto" accept="image/*" className={styles.fileInput} onChange={handleFileChange} />
                                        <span className={styles.fileHint}>
                                            {passportFile ? <span className={styles.successText}>{passportFile}</span> : "Visible on your profile (Max 10MB)"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION: CREDENTIALS */}
                            <div className={styles.sectionLabel} style={{ marginTop: '1rem' }}>
                                <Lock size={16} /> <span>Account Credentials</span>
                            </div>
                            <div className={styles.fieldGroup}>
                                <div className={styles.inputWrapper}>
                                    <label>Legal Full Name</label>
                                    <div className={styles.inputIconBox}><User size={18} /></div>
                                    <input name="fullName" defaultValue={defaultName} placeholder="John Doe" required />
                                </div>
                                <div className={styles.inputWrapper}>
                                    <label>Email Address</label>
                                    <div className={styles.inputIconBox}><Mail size={18} /></div>
                                    <input name="email" defaultValue={defaultEmail} type="email" required />
                                </div>
                                <div className={styles.grid2}>
                                    <div className={styles.inputWrapper}>
                                        <label>Password</label>
                                        <input name="password" type="password" placeholder="••••••••" required />
                                    </div>
                                    <div className={styles.inputWrapper}>
                                        <label>Transaction PIN</label>
                                        <input name="pin" type="password" maxLength={4} placeholder="• • • •" className={styles.pinInput} required />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION: PERSONAL PROFILE */}
                            <div className={styles.sectionLabel} style={{ marginTop: '1rem' }}>
                                <Fingerprint size={16} /> <span>Personal Profile</span>
                            </div>
                            <div className={styles.fieldGroup}>
                                <div className={styles.grid2}>
                                    <div className={styles.inputWrapper}>
                                        <label>Date of Birth</label>
                                        <input name="dateOfBirth" type="date" required />
                                    </div>
                                    <div className={styles.inputWrapper}>
                                        <label>Gender</label>
                                        <select name="gender" required >
                                            <option value="">Select Identity...</option>
                                            <option value="Female">Female</option>
                                            <option value="Male">Male</option>
                                            <option value="non-binary">Non-Binary</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className={styles.grid2}>
                                    <div className={styles.inputWrapper}>
                                        <label>Mobile Phone</label>
                                        <input name="phone" type="tel" placeholder="+1..." />
                                    </div>
                                    <div className={styles.inputWrapper}>
                                        <label>Occupation</label>
                                        <input name="occupation" placeholder="Position / Role" />
                                    </div>
                                </div>
                                <div className={styles.inputWrapper}>
                                    <label>Tax ID / SSN</label>
                                    <input name="taxId" placeholder="XXX-XX-XXXX" />
                                </div>
                            </div>
                        </div>

                        {/* ================= RIGHT COLUMN ================= */}
                        <div className={styles.colRight}>

                            {/* SECTION: RESIDENCY */}
                            <div className={styles.sectionLabel}>
                                <MapPin size={16} /> <span>Residency & Next of Kin</span>
                            </div>
                            <div className={styles.fieldGroup}>
                                <div className={styles.inputWrapper}>
                                    <label>Street Address</label>
                                    <input name="address" placeholder="1234 Wall Street, Penthouse 4" />
                                </div>

                                {/* 3-Column Grid for Zip/City */}
                                <div className={styles.grid3}>
                                    <div className={styles.inputWrapper}>
                                        <label>City</label>
                                        <input name="city" placeholder="City" />
                                    </div>
                                    <div className={styles.inputWrapper}>
                                        <label>Country</label>
                                        <input name="country" defaultValue="United States" />
                                    </div>
                                    <div className={styles.inputWrapper}>
                                        <label>Zip Code</label>
                                        <input name="zipCode" defaultValue="99950" />
                                    </div>
                                </div>

                                {/* NOK SUB-SECTION */}
                                <div className={styles.nokBox}>
                                    <div className={styles.miniHeader}><HeartHandshake size={14} /> Emergency Contact</div>
                                    <div className={styles.fieldGroup}>
                                        <div className={styles.inputWrapper}>
                                            <label>Full Name</label>
                                            <input name="nokName" placeholder="NOK Name" />
                                        </div>
                                        <div className={styles.grid2}>
                                            <div className={styles.inputWrapper}>
                                                <label>Relationship</label>
                                                <select name="nokRelationship">
                                                    <option value="" disabled>Select...</option>
                                                    <option value="Spouse">Spouse</option>
                                                    <option value="Parent">Parent</option>
                                                    <option value="Sibling">Sibling</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div className={styles.inputWrapper}>
                                                <label>Phone Number</label>
                                                <input name="nokPhone" placeholder="Contact Phone" />
                                            </div>
                                        </div>
                                        <div className={styles.inputWrapper}>
                                            <label>Email Address</label>
                                            <input name="nokEmail" type="email" placeholder="nok@example.com" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION: KYC */}
                            <div className={styles.sectionLabel} style={{ marginTop: '1rem' }}>
                                <FileText size={16} /> <span>Identity Verification</span>
                            </div>
                            <div className={styles.fieldGroup}>
                                <div className={styles.inputWrapper}>
                                    <label>Document Type</label>
                                    <select name="docType">
                                        <option value="passport">International Passport</option>
                                        <option value="dl">Driver&apos;s License</option>
                                        <option value="id">National ID Card</option>
                                    </select>
                                </div>

                                <div className={styles.dropZone}>
                                    <input type="file" name="idDocument" id="idUpload" className={styles.fileInput} onChange={handleFileChange} />
                                    <div className={styles.dropContent}>
                                        <div className={styles.cloudIcon}><UploadCloud size={24} /></div>
                                        {frontFile ? (
                                            <div className={styles.fileSuccess}><span>{frontFile}</span><CheckCircle size={16} /></div>
                                        ) : (
                                            <div className={styles.uploadText}>
                                                <span className={styles.mainText}>Upload Identity Document</span>
                                                <span className={styles.subText}>PNG, JPG or PDF (Max 10MB)</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <p className={styles.complianceNote}>
                                    Your data is encrypted and processed securely.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <button disabled={isPending || !!fileError} className={styles.primaryBtn}>
                            {isPending ? 'Verifying Identity...' : 'Submit Application'}
                            {!isPending && <ArrowRight size={18} />}
                        </button>
                        <p className={styles.legalText}>By creating an account, you agree to {siteName}&apos;s Terms of Service.</p>
                        <div className={styles.loginLink}>Already have an account? <Link href="/login">Sign In</Link></div>
                    </div>

                </form>
            </div>
        </div>
    );
}