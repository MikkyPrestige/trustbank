/* eslint-disable @next/next/no-img-element */

'use client';

import { useState, useActionState, useRef, useEffect } from 'react';
import { updateProfile, changePin, changePassword } from '@/actions/user/settings';
import { mockUpload } from '@/actions/user/upload';
import { User, Lock, Shield, Save, Camera, KeyRound } from 'lucide-react';
import styles from './settings.module.css';
import toast from 'react-hot-toast';

// 1. Define a matching initial state type
const initialState = {
    message: '',
    success: false
};

export default function SettingsTabs({ user }: { user: any }) {
    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

    const [profileState, profileAction, profilePending] = useActionState(updateProfile, initialState);
    const [pinState, pinAction, pinPending] = useActionState(changePin, initialState);
    const [passState, passAction, passPending] = useActionState(changePassword, initialState);

    // Image Upload
    const [avatarUrl, setAvatarUrl] = useState(user.image || '');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        // 1. Upload File
        const res = await mockUpload(formData);

        // 2. Update local state
        if (res.success) {
            setAvatarUrl(res.url);
        }
        setUploading(false);
    };

    // Trigger Toast on Server Action Result
    useEffect(() => {
        if (profileState?.message) {
            profileState.success
                ? toast.success(profileState.message)
                : toast.error(profileState.message);
        }
    }, [profileState]);

    useEffect(() => {
        if (pinState?.message) {
            pinState.success
                ? toast.success(pinState.message)
                : toast.error(pinState.message);
        }
    }, [pinState]);

    useEffect(() => {
        if (passState?.message) {
            passState.success
                ? toast.success(passState.message)
                : toast.error(passState.message);
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
                        <div className={styles.avatarSection}>
                            <div className={styles.avatarWrapper}>
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt="Profile"
                                        className={styles.avatarImg}
                                    />
                                ) : (
                                    <div className={styles.avatarPlaceholder}>{user.fullName[0]}</div>
                                )}
                                <button
                                    type="button"
                                    className={styles.cameraBtn}
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                >
                                    <Camera size={14} />
                                </button>
                                <input
                                    type="file"
                                    hidden
                                    ref={fileInputRef}
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                            </div>
                            <div className={styles.avatarText}>
                                <h3>{user.fullName}</h3>
                                <p>{user.email}</p>
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div className={styles.group}>
                                <label>Full Name</label>
                                <input defaultValue={user.fullName} disabled className={styles.inputDisabled} />
                            </div>
                            <div className={styles.group}>
                                <label>Email</label>
                                <input defaultValue={user.email} disabled className={styles.inputDisabled} />
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div className={styles.group}>
                                <label>Phone Number</label>
                                <input name="phone" defaultValue={user.phone || ''} className={styles.input} />
                            </div>
                            <div className={styles.group}>
                                <label>Occupation</label>
                                <input name="occupation" defaultValue={user.occupation || ''} className={styles.input} />
                            </div>
                        </div>

                        <div className={styles.group}>
                            <label>Address</label>
                            <input name="address" defaultValue={user.address || ''} className={styles.input} />
                        </div>

                        <div className={styles.row}>
                            <div className={styles.group}>
                                <label>City</label>
                                <input name="city" defaultValue={user.city || ''} className={styles.input} />
                            </div>
                            <div className={styles.group}>
                                <label>Country</label>
                                <input name="country" defaultValue={user.country || ''} className={styles.input} />
                            </div>
                        </div>

                        <div className={styles.divider}>Next of Kin</div>

                        <div className={styles.row}>
                            <div className={styles.group}>
                                <label>NOK Name</label>
                                <input name="nokName" defaultValue={user.nokName || ''} className={styles.input} />
                            </div>
                            <div className={styles.group}>
                                <label>NOK Phone</label>
                                <input name="nokPhone" defaultValue={user.nokPhone || ''} className={styles.input} />
                            </div>
                        </div>

                        <button disabled={profilePending} className={styles.saveBtn}>
                            <Save size={16} /> {profilePending ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                )}

                {/* --- SECURITY TAB --- */}
                {activeTab === 'security' && (
                    <>
                        {/* PIN CHANGE FORM */}
                        <form action={pinAction} className={styles.card}>
                            <h3 className={styles.cardTitle}><Lock size={20} color="#fbbf24" /> Transaction PIN</h3>
                            <p className={styles.cardSub}>Enter your current login password to set a new PIN.</p>

                            <div className={styles.row}>
                                <div className={styles.group}>
                                    <label>Current Login Password</label>
                                    <input
                                        name="currentPassword"
                                        type="password"
                                        className={styles.input}
                                        placeholder="Enter your password to authorize"
                                        required
                                    />
                                </div>
                                <div className={styles.group}>
                                    <label>New 4-Digit PIN</label>
                                    <input name="newPin" type="password" maxLength={4} className={styles.input} placeholder="••••" required style={{ textAlign: 'center', letterSpacing: '4px' }} />
                                </div>
                            </div>
                            <button disabled={pinPending} className={styles.saveBtn} style={{ background: '#fbbf24', color: '#000' }}>
                                {pinPending ? 'Updating...' : 'Update PIN'}
                            </button>
                        </form>

                        {/* PASSWORD CHANGE FORM */}
                        <form action={passAction} className={styles.card} style={{ marginTop: '2rem' }}>
                            <h3 className={styles.cardTitle}><KeyRound size={20} color="#3b82f6" /> Login Password</h3>
                            <p className={styles.cardSub}>Used to sign in to your account.</p>

                            <div className={styles.group}>
                                <label>Current Password</label>
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
                                    placeholder="Min 8 chars (e.g. Pass@123)"
                                    required
                                />
                            </div>

                            <button disabled={passPending} className={styles.saveBtn}>
                                {passPending ? 'Updating...' : 'Change Password'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}