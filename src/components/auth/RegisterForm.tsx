'use client';

import { useActionState, useState } from 'react';
import { registerUser } from '@/actions/register';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Lock, User, Shield, MapPin, Users } from 'lucide-react';
import styles from './auth.module.css';

const initialState = {
    message: '',
    errors: {}
};

export default function RegisterForm() {
    const [state, action, isPending] = useActionState(registerUser, initialState);

    // Toggles for optional sections
    const [showPersonal, setShowPersonal] = useState(false);
    const [showContact, setShowContact] = useState(false);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Open Your Account</h1>
                <p>Join TrustBank Enterprise today.</p>
            </div>

            <form action={action} className={styles.form}>

                {/* GLOBAL ERROR MESSAGE */}
                {state?.message && (
                    <div className={`${styles.alert} ${state.success ? styles.success : styles.error}`}>
                        {state.message}
                    </div>
                )}

                {/* --- SECTION 1: ESSENTIALS (REQUIRED) --- */}
                <div className={styles.section}>
                    <div className={styles.sectionTitle}>
                        <Lock size={18} /> Account Credentials
                    </div>

                    <div className={styles.row}>
                        <div className={styles.group}>
                            <label>Full Legal Name <span className={styles.req}>*</span></label>
                            <input name="fullName" placeholder="John Doe" required className={styles.input} />
                            <ErrorMsg errors={state?.errors?.fullName} />
                        </div>
                    </div>

                    <div className={styles.group}>
                        <label>Email Address <span className={styles.req}>*</span></label>
                        <input name="email" type="email" placeholder="name@example.com" required className={styles.input} />
                        <ErrorMsg errors={state?.errors?.email} />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.group}>
                            <label>Password <span className={styles.req}>*</span></label>
                            <input name="password" type="password" placeholder="••••••" required className={styles.input} />
                            <ErrorMsg errors={state?.errors?.password} />
                        </div>
                        <div className={styles.group}>
                            <label>Transaction PIN <span className={styles.req}>*</span></label>
                            <input
                                name="pin"
                                type="password"
                                maxLength={4}
                                placeholder="4 Digits"
                                required
                                className={styles.input}
                                style={{ letterSpacing: '4px', textAlign: 'center' }}
                            />
                            <ErrorMsg errors={state?.errors?.pin} />
                        </div>
                    </div>
                </div>

                {/* --- SECTION 2: PERSONAL INFO (OPTIONAL) --- */}
                <div className={styles.section}>
                    <button type="button" onClick={() => setShowPersonal(!showPersonal)} className={styles.accordionBtn}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <User size={18} /> Personal Information <span className={styles.optional}>(Optional)</span>
                        </div>
                        {showPersonal ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {showPersonal && (
                        <div className={styles.accordionContent}>
                            <div className={styles.row}>
                                <div className={styles.group}>
                                    <label>Phone Number</label>
                                    <input name="phone" placeholder="+1 (555) 000-0000" className={styles.input} />
                                </div>
                                <div className={styles.group}>
                                    <label>Date of Birth</label>
                                    <input name="dateOfBirth" type="date" className={styles.input} />
                                </div>
                            </div>
                            <div className={styles.row}>
                                <div className={styles.group}>
                                    <label>Gender</label>
                                    <select name="gender" className={styles.select}>
                                        <option value="">Select...</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className={styles.group}>
                                    <label>Occupation</label>
                                    <input name="occupation" placeholder="e.g. Engineer" className={styles.input} />
                                </div>
                            </div>
                            <div className={styles.group}>
                                <label>Tax ID / SSN</label>
                                <input name="taxId" placeholder="XXX-XX-XXXX" className={styles.input} />
                            </div>
                        </div>
                    )}
                </div>

                {/* --- SECTION 3: CONTACT & NOK (OPTIONAL) --- */}
                <div className={styles.section}>
                    <button type="button" onClick={() => setShowContact(!showContact)} className={styles.accordionBtn}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <MapPin size={18} /> Contact & Next of Kin <span className={styles.optional}>(Optional)</span>
                        </div>
                        {showContact ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {showContact && (
                        <div className={styles.accordionContent}>
                            <h4 className={styles.miniHeader}>Your Address</h4>
                            <div className={styles.row}>
                                <div className={styles.group}>
                                    <label>Country</label>
                                    <input name="country" placeholder="Country" className={styles.input} />
                                </div>
                                <div className={styles.group}>
                                    <label>City</label>
                                    <input name="city" placeholder="City" className={styles.input} />
                                </div>
                            </div>
                            <div className={styles.group}>
                                <label>Full Address</label>
                                <input name="address" placeholder="123 Main St, Apt 4B" className={styles.input} />
                            </div>

                            <div className={styles.divider}></div>

                            <h4 className={styles.miniHeader}><Users size={14} /> Next of Kin</h4>
                            <div className={styles.row}>
                                <div className={styles.group}>
                                    <label>NOK Name</label>
                                    <input name="nokName" placeholder="Full Name" className={styles.input} />
                                </div>
                                <div className={styles.group}>
                                    <label>Relationship</label>
                                    <input name="nokRelationship" placeholder="e.g. Spouse" className={styles.input} />
                                </div>
                            </div>
                            <div className={styles.group}>
                                <label>NOK Phone/Email</label>
                                <input name="nokPhone" placeholder="Contact Info" className={styles.input} />
                            </div>
                        </div>
                    )}
                </div>

                <button disabled={isPending} className={styles.submitBtn}>
                    {isPending ? 'Creating Account...' : 'Register Account'}
                </button>

                <p className={styles.footerText}>
                    Already have an account? <Link href="/login" className={styles.link}>Sign In</Link>
                </p>
            </form>
        </div>
    );
}

// Helper for showing field-specific errors
function ErrorMsg({ errors }: { errors?: string[] }) {
    if (!errors || errors.length === 0) return null;
    return <p className={styles.fieldError}>{errors[0]}</p>;
}