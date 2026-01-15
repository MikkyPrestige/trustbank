'use client';

import { useActionState, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { registerUser } from '@/actions/user/register';
import Link from 'next/link';
import {
    Lock, User, MapPin, UploadCloud, ShieldCheck,
    CheckCircle, ArrowRight, FileText, Mail, HeartHandshake, Fingerprint
} from 'lucide-react';
import styles from './RegisterForm.module.css';

const initialState = {
    message: '',
    errors: {},
    success: false
};

export default function RegisterForm() {
    const [state, action, isPending] = useActionState(registerUser, initialState);

    // Get Pre-filled data
    const searchParams = useSearchParams();
    const defaultName = searchParams.get('full_name') || '';
    const defaultEmail = searchParams.get('email') || '';

    // File Preview State
    const [frontFile, setFrontFile] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFrontFile(e.target.files[0].name);
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
                        <p>Your digital vault is being provisioned.</p>
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

            {/* Ambient Background Mesh */}
            <div className={styles.ambientMesh}></div>

            <div className={styles.formContainer}>

                {/* HEADER */}
                <div className={styles.header}>
                    <div className={styles.brandBadge}>
                        <ShieldCheck size={16} />
                        <span>256-Bit Encrypted Protocol</span>
                    </div>
                    <h1>Secure Onboarding</h1>
                    <p>Complete your profile to access TrustBank Enterprise.</p>
                </div>

                <form action={action} className={styles.glassForm}>

                    {state?.message && !state.success && (
                        <div className={styles.errorBanner}>{state.message}</div>
                    )}

                    {/* --- 1. CREDENTIALS --- */}
                    <div className={styles.sectionLabel}>
                        <Lock size={16} /> <span>Account Credentials</span>
                    </div>

                    <div className={styles.fieldGroup}>
                        <div className={styles.inputRow}>
                            <div className={styles.inputWrapper}>
                                <label>Legal Full Name</label>
                                <div className={styles.inputIconBox}><User size={18} /></div>
                                <input name="fullName" defaultValue={defaultName} placeholder="John Doe" required />
                            </div>
                        </div>

                        <div className={styles.inputRow}>
                            <div className={styles.inputWrapper}>
                                <label>Email Address</label>
                                <div className={styles.inputIconBox}><Mail size={18} /></div>
                                <input name="email" defaultValue={defaultEmail} type="email" readOnly className={styles.readOnly} />
                            </div>
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

                    {/* --- 2. PERSONAL DATA --- */}
                    <div className={styles.sectionLabel}>
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
                                <select name="gender">
                                    <option value="">Select Identity...</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
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

                        <div className={styles.inputRow}>
                            <div className={styles.inputWrapper}>
                                <label>Tax ID / SSN</label>
                                <input name="taxId" placeholder="XXX-XX-XXXX" />
                            </div>
                        </div>
                    </div>

                    {/* --- 3. RESIDENCY & NOK --- */}
                    <div className={styles.sectionLabel}>
                        <MapPin size={16} /> <span>Residency & Next of Kin</span>
                    </div>

                    <div className={styles.fieldGroup}>
                        <div className={styles.inputRow}>
                            <div className={styles.inputWrapper}>
                                <label>Street Address</label>
                                <input name="address" placeholder="1234 Wall Street, Penthouse 4" />
                            </div>
                        </div>

                        <div className={styles.grid2}>
                            <div className={styles.inputWrapper}>
                                <label>City</label>
                                <input name="city" placeholder="City" />
                            </div>
                            <div className={styles.inputWrapper}>
                                <label>Country</label>
                                <input name="country" defaultValue="United States" />
                            </div>
                        </div>

                        {/* NOK AREA (Restored & Enhanced) */}
                        <div className={styles.nokBox}>
                            <div className={styles.miniHeader}><HeartHandshake size={14} /> Emergency Contact (Next of Kin)</div>
                            <div className={styles.inputRow}>
                                <div className={styles.inputWrapper}>
                                    <label>Full Name</label>
                                    <input name="nokName" placeholder="NOK Name" />
                                </div>
                            </div>
                            <div className={styles.grid2}>
                                <div className={styles.inputWrapper}>
                                    <label>Relationship</label>
                                    <input name="nokRelationship" placeholder="e.g. Spouse" />
                                </div>
                                <div className={styles.inputWrapper}>
                                    <label>Phone Number</label>
                                    <input name="nokPhone" placeholder="Contact Phone" />
                                </div>
                            </div>
                            {/* ✅ RESTORED EMAIL INPUT */}
                            <div className={styles.inputRow}>
                                <div className={styles.inputWrapper}>
                                    <label>Email Address</label>
                                    <input name="nokEmail" type="email" placeholder="nok@example.com" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- 4. KYC / COMPLIANCE --- */}
                    <div className={styles.sectionLabel}>
                        <FileText size={16} /> <span>Identity Verification (KYC)</span>
                    </div>

                    <div className={styles.kycContainer}>
                        <div className={styles.inputRow}>
                            <div className={styles.inputWrapper}>
                                <label>Document Type</label>
                                <select name="docType">
                                    <option value="passport">International Passport</option>
                                    <option value="dl">Driver&apos;s License</option>
                                    <option value="id">National ID Card</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.dropZone}>
                            <input type="file" id="idUpload" className={styles.fileInput} onChange={handleFileChange} />
                            <div className={styles.dropContent}>
                                <div className={styles.cloudIcon}>
                                    <UploadCloud size={24} />
                                </div>
                                {frontFile ? (
                                    <div className={styles.fileSuccess}>
                                        <span>{frontFile}</span>
                                        <CheckCircle size={16} />
                                    </div>
                                ) : (
                                    <div className={styles.uploadText}>
                                        <span className={styles.mainText}>Upload Identity Document</span>
                                        <span className={styles.subText}>PNG, JPG or PDF (Max 10MB)</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <p className={styles.complianceNote}>
                            Your data is processed securely in compliance with federal banking regulations.
                        </p>
                    </div>

                    {/* SUBMIT */}
                    <div className={styles.footer}>
                        <button disabled={isPending} className={styles.primaryBtn}>
                            {isPending ? 'Verifying Identity...' : 'Submit Application'}
                            {!isPending && <ArrowRight size={18} />}
                        </button>
                        <p className={styles.legalText}>
                            By creating an account, you agree to TrustBank&apos;s Terms of Service.
                        </p>
                        <div className={styles.loginLink}>
                            Already have an account? <Link href="/login">Sign In</Link>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
}



// 'use client';

// import { useActionState, useState } from 'react';
// import { registerUser } from '@/actions/user/register';
// import Link from 'next/link';
// import { ChevronDown, ChevronUp, Lock, User, MapPin, Users, CheckCircle, ArrowRight } from 'lucide-react';
// import styles from './auth.module.css';

// const initialState = {
//     message: '',
//     errors: {},
//     success: false
// };

// export default function RegisterForm() {
//     const [state, action, isPending] = useActionState(registerUser, initialState);

//     // Toggles for optional sections
//     const [showPersonal, setShowPersonal] = useState(false);
//     const [showContact, setShowContact] = useState(false);

//     // ✅ SUCCESS VIEW
//     if (state?.success) {
//         return (
//             <div className={styles.container}>
//                 <div className={styles.successState}>
//                     <div className={styles.successIconBox}>
//                         <CheckCircle size={48} strokeWidth={1.5} />
//                     </div>
//                     <h1>Account Created!</h1>
//                     <p>{state.message}</p>

//                     <div className={styles.successDetails}>
//                         <p>Your TrustBank Enterprise account is ready.</p>
//                         <p>Please sign in to access your dashboard.</p>
//                     </div>

//                     <Link href="/login" className={styles.loginBtn}>
//                         Sign In Now <ArrowRight size={18} />
//                     </Link>
//                 </div>
//             </div>
//         );
//     }

//     // 📝 REGISTRATION FORM VIEW
//     return (
//         <div className={styles.container}>
//             <div className={styles.header}>
//                 <h1>Open Your Account</h1>
//                 <p>Join TrustBank Enterprise today.</p>
//             </div>

//             <form action={action} className={styles.form}>

//                 {/* ERROR MESSAGE (Only show errors here, success is handled above) */}
//                 {state?.message && !state.success && (
//                     <div className={`${styles.alert} ${styles.error}`}>
//                         {state.message}
//                     </div>
//                 )}

//                 {/* --- SECTION 1: ESSENTIALS (REQUIRED) --- */}
//                 <div className={styles.section}>
//                     <div className={styles.sectionTitle}>
//                         <Lock size={18} /> Account Credentials
//                     </div>

//                     <div className={styles.row}>
//                         <div className={styles.group}>
//                             <label>Full Legal Name <span className={styles.req}>*</span></label>
//                             <input name="fullName" placeholder="John Doe" required className={styles.input} />
//                             <ErrorMsg errors={state?.errors?.fullName} />
//                         </div>
//                     </div>

//                     <div className={styles.group}>
//                         <label>Email Address <span className={styles.req}>*</span></label>
//                         <input name="email" type="email" placeholder="name@example.com" required className={styles.input} />
//                         <ErrorMsg errors={state?.errors?.email} />
//                     </div>

//                     <div className={styles.row}>
//                         <div className={styles.group}>
//                             <label>Password <span className={styles.req}>*</span></label>
//                             <input name="password" type="password" placeholder="••••••" required className={styles.input} />
//                             <ErrorMsg errors={state?.errors?.password} />
//                         </div>
//                         <div className={styles.group}>
//                             <label>Transaction PIN <span className={styles.req}>*</span></label>
//                             <input
//                                 name="pin"
//                                 type="password"
//                                 maxLength={4}
//                                 placeholder="4 Digits"
//                                 required
//                                 className={styles.input}
//                                 style={{ letterSpacing: '4px', textAlign: 'center' }}
//                             />
//                             <ErrorMsg errors={state?.errors?.pin} />
//                         </div>
//                     </div>
//                 </div>

//                 {/* --- SECTION 2: PERSONAL INFO (OPTIONAL) --- */}
//                 <div className={styles.section}>
//                     <button type="button" onClick={() => setShowPersonal(!showPersonal)} className={styles.accordionBtn}>
//                         <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
//                             <User size={18} /> Personal Information <span className={styles.optional}>(Optional)</span>
//                         </div>
//                         {showPersonal ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//                     </button>

//                     {showPersonal && (
//                         <div className={styles.accordionContent}>
//                             <div className={styles.row}>
//                                 <div className={styles.group}>
//                                     <label>Phone Number</label>
//                                     <input name="phone" placeholder="+1 (555) 000-0000" className={styles.input} />
//                                 </div>
//                                 <div className={styles.group}>
//                                     <label>Date of Birth</label>
//                                     <input name="dateOfBirth" type="date" className={styles.input} />
//                                 </div>
//                             </div>
//                             <div className={styles.row}>
//                                 <div className={styles.group}>
//                                     <label>Gender</label>
//                                     <select name="gender" className={styles.select}>
//                                         <option value="">Select...</option>
//                                         <option value="Male">Male</option>
//                                         <option value="Female">Female</option>
//                                         <option value="Other">Other</option>
//                                     </select>
//                                 </div>
//                                 <div className={styles.group}>
//                                     <label>Occupation</label>
//                                     <input name="occupation" placeholder="e.g. Engineer" className={styles.input} />
//                                 </div>
//                             </div>
//                             <div className={styles.group}>
//                                 <label>Tax ID / SSN</label>
//                                 <input name="taxId" placeholder="XXX-XX-XXXX" className={styles.input} />
//                             </div>
//                         </div>
//                     )}
//                 </div>

//                 {/* --- SECTION 3: CONTACT & NOK (OPTIONAL) --- */}
//                 <div className={styles.section}>
//                     <button type="button" onClick={() => setShowContact(!showContact)} className={styles.accordionBtn}>
//                         <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
//                             <MapPin size={18} /> Contact & Next of Kin <span className={styles.optional}>(Optional)</span>
//                         </div>
//                         {showContact ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//                     </button>

//                     {showContact && (
//                         <div className={styles.accordionContent}>
//                             <h4 className={styles.miniHeader}>Your Address</h4>
//                             <div className={styles.row}>
//                                 <div className={styles.group}>
//                                     <label>Country</label>
//                                     <input name="country" placeholder="Country" className={styles.input} />
//                                 </div>
//                                 <div className={styles.group}>
//                                     <label>City</label>
//                                     <input name="city" placeholder="City" className={styles.input} />
//                                 </div>
//                             </div>
//                             <div className={styles.group}>
//                                 <label>Full Address</label>
//                                 <input name="address" placeholder="123 Main St, Apt 4B" className={styles.input} />
//                             </div>

//                             <div className={styles.divider}></div>

//                             <h4 className={styles.miniHeader}><Users size={14} /> Next of Kin</h4>
//                             <div className={styles.row}>
//                                 <div className={styles.group}>
//                                     <label>NOK Name</label>
//                                     <input name="nokName" placeholder="Full Name" className={styles.input} />
//                                 </div>
//                                 <div className={styles.group}>
//                                     <label>Relationship</label>
//                                     <input name="nokRelationship" placeholder="e.g. Spouse" className={styles.input} />
//                                 </div>
//                             </div>
//                             <div className={styles.group}>
//                                 <label>NOK Phone/Email</label>
//                                 <input name="nokPhone" placeholder="Contact Info" className={styles.input} />
//                             </div>
//                         </div>
//                     )}
//                 </div>

//                 <button disabled={isPending} className={styles.submitBtn}>
//                     {isPending ? 'Creating Account...' : 'Register Account'}
//                 </button>

//                 <p className={styles.footerText}>
//                     Already have an account? <Link href="/login" className={styles.link}>Sign In</Link>
//                 </p>
//             </form>
//         </div>
//     );
// }

// // Helper for showing field-specific errors
// function ErrorMsg({ errors }: { errors?: string[] }) {
//     if (!errors || errors.length === 0) return null;
//     return <p className={styles.fieldError}>{errors[0]}</p>;
// }