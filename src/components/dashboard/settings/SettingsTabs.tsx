/* eslint-disable @next/next/no-img-element */
'use client';

import Link from "next/link";
import { useState, useActionState, useRef, useEffect } from 'react';
import { updateProfile, changePin, changePassword } from '@/actions/user/settings';
import { updateAvatar } from '@/actions/user/avatar';
import { User, Lock, Shield, Save, Camera, KeyRound, Loader2, HeartHandshake } from 'lucide-react';
import styles from './settings.module.css';
import toast from 'react-hot-toast';

interface SettingsUser {
    id: string;
    fullName: string;
    email: string;
    image?: string | null;
    phone?: string | null;
    occupation?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    zipCode?: string | null;
    taxId?: string | null;
    dateOfBirth?: Date | string | null;
    gender?: string | null;
    nokName?: string | null;
    nokPhone?: string | null;
    nokEmail?: string | null;
    nokRelationship?: string | null;
    nokAddress?: string | null;
}

const initialState = { message: '', success: false };

export default function SettingsTabs({ user }: { user: SettingsUser }) {
    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

    const [profileState, profileAction, profilePending] = useActionState(updateProfile, initialState);
    const [pinState, pinAction, pinPending] = useActionState(changePin, initialState);
    const [passState, passAction, passPending] = useActionState(changePassword, initialState);

    // Image Upload State
    const [avatarUrl, setAvatarUrl] = useState(user.image || '');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const loadingToast = toast.loading("Uploading secure image...");

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await updateAvatar(formData);
            toast.dismiss(loadingToast);

            if (res.success && res.url) {
                setAvatarUrl(res.url);
                toast.success(res.message);
            } else {
                toast.error(res.message || "Upload failed");
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error("Upload failed due to network error.");
        } finally {
            setUploading(false);
        }
    };

    // Toasts
    useEffect(() => {
        if (profileState?.message) {
            profileState.success ? toast.success(profileState.message) : toast.error(profileState.message);
        }
    }, [profileState]);

    useEffect(() => {
        if (pinState?.message) {
            pinState.success ? toast.success(pinState.message) : toast.error(pinState.message);
        }
    }, [pinState]);

    useEffect(() => {
        if (passState?.message) {
            passState.success ? toast.success(passState.message) : toast.error(passState.message);
        }
    }, [passState]);

    return (
        <div className={styles.wrapper}>
            {/* SIDEBAR TABS */}
            <div className={styles.sidebar}>
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`${styles.tabBtn} ${activeTab === 'profile' ? styles.active : ''}`}
                >
                    <User size={18} /> Profile Information
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`${styles.tabBtn} ${activeTab === 'security' ? styles.active : ''}`}
                >
                    <Shield size={18} /> Security & PIN
                </button>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className={styles.main}>

                {/* --- PROFILE TAB --- */}
                {activeTab === 'profile' && (
                    <form action={profileAction} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2>Personal Details</h2>
                            <p>Manage your identity and contact information.</p>
                        </div>

                        {/* AVATAR SECTION */}
                        <div className={styles.avatarSection}>
                            <div className={styles.avatarWrapper}>
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Profile" className={styles.avatarImg} />
                                ) : (
                                    <div className={styles.avatarPlaceholder}>{user.fullName[0]}</div>
                                )}
                                <div className={styles.overlay} onClick={() => !uploading && fileInputRef.current?.click()}>
                                    {uploading ? <Loader2 className={styles.spin} /> : <Camera size={20} />}
                                </div>
                                <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleAvatarChange} />
                            </div>
                            <div className={styles.avatarText}>
                                <h3>{user.fullName}</h3>
                                <p>{user.email}</p>
                            </div>
                        </div>

                        {/* READ-ONLY FIELDS */}
                        <div className={styles.grid}>
                            <div className={styles.group}>
                                <label>Full Name</label>
                                <input defaultValue={user.fullName} disabled className={styles.inputDisabled} />
                            </div>
                            <div className={styles.group}>
                                <label>Email Address</label>
                                <input defaultValue={user.email} disabled className={styles.inputDisabled} />
                            </div>
                            <div className={styles.group}>
                                <label>Date of Birth</label>
                                <input
                                    defaultValue={user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : ''}
                                    disabled
                                    className={styles.inputDisabled}
                                />
                            </div>
                            <div className={styles.group}>
                                <label>Gender</label>
                                <input defaultValue={user.gender || ''} disabled className={styles.inputDisabled} />
                            </div>
                        </div>

                        {/* EDITABLE CONTACT FIELDS */}
                        <div className={styles.divider}>Contact Details</div>

                        {/* Row 1: Phone & Occupation */}
                        <div className={styles.grid}>
                            <div className={styles.group}>
                                <label>Phone Number</label>
                                <input name="phone" defaultValue={user.phone || ''} className={styles.input} placeholder="+1 555..." />
                            </div>
                            <div className={styles.group}>
                                <label>Occupation</label>
                                <input name="occupation" defaultValue={user.occupation || ''} className={styles.input} />
                            </div>
                        </div>

                        {/* Row 2: Tax ID (Full Width) */}
                        <div className={styles.group}>
                            <label>Tax ID / SSN</label>
                            <input name="taxId" defaultValue={user.taxId || ''} className={styles.input} />
                        </div>

                        {/* Row 3: Street Address (Full Width) */}
                        <div className={`${styles.group} ${styles.topMargin}`}>
                            <label>Street Address</label>
                            <input name="address" defaultValue={user.address || ''} className={styles.input} />
                        </div>

                        {/* Row 4 & 5: Paired Address Fields */}
                        <div className={styles.grid}>
                            <div className={styles.group}>
                                <label>City</label>
                                <input name="city" defaultValue={user.city || ''} className={styles.input} />
                            </div>
                            <div className={styles.group}>
                                <label>State / Province</label>
                                <input name="state" defaultValue={user.state || ''} className={styles.input} />
                            </div>
                            <div className={styles.group}>
                                <label>Zip Code</label>
                                <input name="zipCode" defaultValue={user.zipCode || ''} className={styles.input} />
                            </div>
                            <div className={styles.group}>
                                <label>Country</label>
                                <input name="country" defaultValue={user.country || ''} className={styles.input} />
                            </div>
                        </div>

                        <div className={styles.divider}>
                            <HeartHandshake size={16} className={styles.dividerIcon} />
                            Next of Kin
                        </div>

                        <div className={styles.grid}>
                            <div className={styles.group}>
                                <label>Full Name</label>
                                <input name="nokName" defaultValue={user.nokName || ''} className={styles.input} placeholder="Full Name" />
                            </div>
                            <div className={styles.group}>
                                <label>Phone Number</label>
                                <input name="nokPhone" defaultValue={user.nokPhone || ''} className={styles.input} placeholder="Contact Number" />
                            </div>
                        </div>

                        <div className={styles.grid}>
                            <div className={styles.group}>
                                <label>Email Address</label>
                                <input name="nokEmail" type="email" defaultValue={user.nokEmail || ''} className={styles.input} placeholder="email@example.com" />
                            </div>
                            <div className={styles.group}>
                                <label>Relationship</label>
                                <select
                                    name="nokRelationship"
                                    defaultValue={user.nokRelationship || ''}
                                    className={styles.input}
                                >
                                    <option value="" disabled>Select...</option>
                                    <option value="Spouse">Spouse/Partner</option>
                                    <option value="Parent">Parent</option>
                                    <option value="Child">Child</option>
                                    <option value="Sibling">Sibling</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.group}>
                            <label>Address</label>
                            <input name="nokAddress" defaultValue={user.nokAddress || ''} className={styles.input} placeholder="Street Address" />
                        </div>

                        <div className={styles.actionRow}>
                            <button disabled={profilePending} className={styles.saveBtn}>
                                {profilePending ? <Loader2 className={styles.spin} size={18} /> : <><Save size={18} /> Save Changes</>}
                            </button>
                        </div>
                    </form>
                )}

                {/* --- SECURITY TAB --- */}
                {activeTab === 'security' && (
                    <div className={styles.securityStack}>
                        {/* PIN CHANGE */}
                        <form action={pinAction} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.iconBadge}><Lock size={20} /></div>
                                <div>
                                    <h3>Transaction PIN</h3>
                                    <p>Used to authorize money transfers.</p>
                                </div>
                            </div>

                            <div className={styles.grid}>
                                <div className={styles.group}>
                                    <label>Current Login Password</label>
                                    <input name="currentPassword" type="password" className={styles.input} required placeholder="Authorize with password" />
                                </div>
                                <div className={styles.group}>
                                    <label>New 4-Digit PIN</label>
                                    <input name="newPin" type="password" maxLength={4} className={`${styles.input} ${styles.pinInput}`} placeholder="••••" required />
                                </div>
                            </div>
                            <button disabled={pinPending} className={styles.saveBtn}>
                                {pinPending ? <Loader2 className={styles.spin} /> : 'Update PIN'}
                            </button>
                        </form>

                        {/* PASSWORD CHANGE */}
                        <form action={passAction} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={`${styles.iconBadge} ${styles.iconBadgeBlue}`}><KeyRound size={20} /></div>
                                <div>
                                    <h3>Login Password</h3>
                                    <p>Secure your account access.</p>
                                </div>
                            </div>

                            <div className={styles.grid}>
                                <div className={styles.group}>
                                    <div className={styles.labelRow}>
                                        <label>Current Password</label>
                                        <Link
                                            href="/forgot-password"
                                            className={styles.forgotLink}
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <input
                                        name="currentPassword"
                                        type="password"
                                        className={styles.input}
                                        required
                                    />
                                </div>
                                <div className={styles.group}>
                                    <label>New Password</label>
                                    <input
                                        name="newPassword"
                                        type="password"
                                        className={styles.input}
                                        required
                                        placeholder="Min 8 characters"
                                    />
                                </div>
                            </div>
                            <button disabled={passPending} className={styles.saveBtn}>
                                {passPending ? <Loader2 className={styles.spin} /> : 'Change Password'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}