/* eslint-disable @next/next/no-img-element */
'use client';

import Link from "next/link";
import { useState, useActionState, useRef, useEffect } from 'react';
import { updateAvatar, updateProfile, changePin, changePassword, logoutAllDevices, closeAccount } from '@/actions/user/settings';
import { User, Lock, Shield, Save, Camera, KeyRound, Loader2, HeartHandshake, AlertTriangle, ShieldCheck, LogOut } from 'lucide-react'
import styles from './styles/settings.module.css';
import toast from 'react-hot-toast';
import { signOut } from "next-auth/react";
import CurrencySelector from "./CurrencySelector";

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
    currency?: string;
}

const initialState = { message: '', success: false };

export default function SettingsTabs({ user }: { user: SettingsUser }) {
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'account'>('profile');
    const [profileState, profileAction, profilePending] = useActionState(updateProfile, initialState);
    const [pinState, pinAction, pinPending] = useActionState(changePin, initialState);
    const [passState, passAction, passPending] = useActionState(changePassword, initialState);
    const [avatarUrl, setAvatarUrl] = useState(user.image || '');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isClosing, setIsClosing] = useState(false);
    const [closePassword, setClosePassword] = useState("");
    const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

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

    const handleGlobalLogout = async () => {
        const confirmed = window.confirm(
            "This will log you out of all devices including this one. You will need to log back in. Continue?"
        );
        if (!confirmed) return;

        setIsLoggingOutAll(true);
        const res = await logoutAllDevices();

        if (res.success) {
            toast.success("Security reset successful!");
            await signOut({ callbackUrl: '/login?reason=security_reset' });
        } else {
            toast.error(res.error || "Failed to reset sessions.");
            setIsLoggingOutAll(false);
        }
    };

    const handleCloseAccount = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!closePassword) {
            alert("Please enter your password to confirm.");
            return;
        }

        const confirm = window.confirm("FINAL WARNING: This action cannot be undone.\n\nAre you sure you want to permanently close your account?");
        if (!confirm) return;

        setIsClosing(true);

        const res = await closeAccount(closePassword);

        if (res.success) {
            await signOut({ callbackUrl: '/login' });
        } else {
            alert(res.error || "Failed to close account.");
            setIsClosing(false);
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
            <div className={styles.sidebar}>
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`${styles.tabBtn} ${activeTab === 'profile' ? styles.active : ''}`}
                >
                    <User size={20} /> Profile Information
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`${styles.tabBtn} ${activeTab === 'security' ? styles.active : ''}`}
                >
                    <Shield size={20} /> Security & Access
                </button>
                <button
                    onClick={() => setActiveTab('account')}
                    className={`${styles.tabBtn} ${activeTab === 'account' ? styles.active : ''}`}
                >
                    <KeyRound size={20} /> Account Preferences
                </button>
            </div>

            <div className={styles.main}>
                {/* --- PROFILE TAB --- */}
                {activeTab === 'profile' && (
                    <div className={styles.stack}>
                        <form action={profileAction} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h2>Personal Details</h2>
                                <p>Manage your identity and contact information.</p>
                            </div>
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
                            <div className={styles.group}>
                                <label>Tax ID / SSN</label>
                                <input name="taxId" defaultValue={user.taxId || ''} className={styles.input} />
                            </div>
                            <div className={styles.group}>
                                <label>Street Address</label>
                                <input name="address" defaultValue={user.address || ''} className={styles.input} />
                            </div>
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
                    </div>
                )}

                {/* --- SECURITY TAB --- */}
                {activeTab === 'security' && (
                    <div className={styles.stack}>
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

                        {/* SESSION MANAGEMENT */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={`${styles.iconBadge} ${styles.iconBadgeGreen}`}>
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <h3>Active Sessions</h3>
                                    <p>Manage your account access across all devices.</p>
                                </div>
                            </div>
                            <div className={styles.sessionBox}>
                                <p className={styles.sessionText}>
                                    Logged in on a public computer or lost a device?
                                    You can sign out of every active session instantly.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleGlobalLogout}
                                    disabled={isLoggingOutAll}
                                    className={styles.outlineBtn}
                                >
                                    {isLoggingOutAll ? (
                                        <Loader2 className={styles.spin} size={20} />
                                    ) : (
                                        <> <LogOut size={20} /> Logout All Devices</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- ACCOUNT PREFERENCES --- */}
                {activeTab === 'account' && (
                    <div className={styles.stack}>
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.iconBadge}><Save size={20} /></div>
                                <div>
                                    <h3>Local Currency</h3>
                                    <p>Set your preferred currency for dashboard balances.</p>
                                </div>
                            </div>
                            <CurrencySelector currentCurrency={user.currency || "USD"} />
                        </div>

                        {/* DANGER ZONE */}
                        <div className={styles.dangerCard}>
                            <div className={styles.dangerHeader}>
                                <div className={styles.dangerIconBadge}>
                                    <AlertTriangle size={22} />
                                </div>
                                <h3 className={styles.dangerTitle}>Close Account</h3>
                            </div>
                            <p className={styles.dangerText}>
                                Closing your account will permanently disable your access, freeze all cards,
                                and cancel pending transactions. You must have a <strong>$0.00</strong> balance
                                to proceed.
                            </p>
                            <div className={styles.dangerGroup}>
                                <label className={styles.dangerLabel}>
                                    Enter Password to Confirm
                                </label>
                                <input
                                    type="password"
                                    value={closePassword}
                                    onChange={(e) => setClosePassword(e.target.value)}
                                    className={styles.dangerInput}
                                    placeholder="Your current password"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={handleCloseAccount}
                                    disabled={isClosing || !closePassword}
                                    className={styles.deleteBtn}
                                >
                                    {isClosing ? <Loader2 className={styles.spin} size={20} /> : 'Close My Account'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}