'use client';

import { useActionState, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { registerUser } from '@/actions/user/register';
import { verifyOtp } from '@/actions/user/otp';
import Link from 'next/link';
import {
    Lock, User, MapPin, UploadCloud,
    CheckCircle, ArrowRight, FileText, Mail, HeartHandshake, Fingerprint, Camera, AlertCircle, Loader2, Check, Wallet
} from 'lucide-react';
import styles from './styles/RegisterForm.module.css';
import toast from 'react-hot-toast';

const initialState = {
    message: '',
    errors: {},
    success: false,
    requireOtp: false,
    email: '',
    callbackUrl: ''
};

const MAX_TOTAL_SIZE = 25 * 1024 * 1024;   // 25 mb

interface RegisterFormProps {
    siteName?: string;
}

export default function RegisterForm({ siteName }: RegisterFormProps) {
    const [state, action, isPending] = useActionState(registerUser, initialState);
    const [fileError, setFileError] = useState<string | null>(null);
    const router = useRouter();
    const [showOtp, setShowOtp] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [otpError, setOtpError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const searchParams = useSearchParams();
    const defaultName = searchParams.get('full_name') || '';
    const defaultEmail = searchParams.get('email') || '';
    const [frontFile, setFrontFile] = useState<string | null>(null);
    const [backFile, setBackFile] = useState<string | null>(null);
    const [passportFile, setPassportFile] = useState<string | null>(null);
    const [sizes, setSizes] = useState({ passport: 0, front: 0, back: 0 });
    const callbackUrl = searchParams.get('callbackUrl') || '';

    useEffect(() => {
        if (state?.requireOtp) {
            setShowOtp(true);
        }
    }, [state]);

    // Countdown
    useEffect(() => {
        if (isVerified && countdown > 0) {
            const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
            return () => clearTimeout(timer);
        } else if (isVerified && countdown === 0) {
            const dest = callbackUrl
                ? `/login?verified=true&callbackUrl=${encodeURIComponent(callbackUrl)}`
                : '/login?verified=true';
            router.push(dest);
        }
    }, [isVerified, countdown, router, callbackUrl]);


    useEffect(() => {
        if (state?.isUnverified && state.email) {
            toast.error("Account pending verification. Redirecting...");
            setTimeout(() => {
                const emailParam = encodeURIComponent(state.email || "");
                router.push(`/verify-email?email=${emailParam}`);
            }, 1500);
        }
    }, [state, router]);

    const handleFormSubmit = (formData: FormData) => {
        setFileError(null);
        const frontBlob = formData.get("idDocumentFront") as File;
        const backBlob = formData.get("idDocumentBack") as File;
        const realFrontSize = frontBlob ? frontBlob.size : 0;
        const realBackSize = backBlob ? backBlob.size : 0;

        // "GHOST" FILES
        if (frontFile && realFrontSize === 0) {
            setFileError("Please re-select your ID Front (file was reset).");
            setFrontFile(null);
            return;
        }
        if (backFile && realBackSize === 0) {
            setFileError("Please re-select your ID Back (file was reset).");
            setBackFile(null);
            return;
        }

        // PARTIAL UPLOADS
        const hasFront = realFrontSize > 0;
        const hasBack = realBackSize > 0;

        if ((hasFront && !hasBack) || (!hasFront && hasBack)) {
            setFileError("Incomplete ID Upload. Please upload BOTH front and back images.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        action(formData);
    };

    const handleVerify = async () => {
        if (otpCode.length !== 6) {
            setOtpError("Please enter the 6-digit code sent to your email.");
            return;
        }
        setIsVerifying(true);
        setOtpError("");

        try {
            const result = await verifyOtp(state.email || "", otpCode);

            if (result.success) {
                setIsVerified(true);
            } else {
                const errorMessage = result.error || "Verification failed.";
                setOtpError(errorMessage);

                if (errorMessage.toLowerCase().includes("expired")) {
                    setTimeout(() => {
                        const emailParam = encodeURIComponent(state.email || "");
                        const cbParam = callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : '';
                        router.push(`/verify-email?email=${emailParam}${cbParam}`);
                    }, 1500);
                }
            }
        } catch (err) {
            setOtpError("System error. Please try again.");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const fieldName = e.target.name;
        const newSize = file ? file.size : 0;
        const currentPassport = fieldName === 'passportPhoto' ? newSize : sizes.passport;
        const currentFront = fieldName === 'idDocumentFront' ? newSize : sizes.front;
        const currentBack = fieldName === 'idDocumentBack' ? newSize : sizes.back;
        const totalSize = currentPassport + currentFront + currentBack;

        setFileError(null);

        if (file) {
            if (totalSize > MAX_TOTAL_SIZE) {
                const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
                setFileError(`Total upload size (${sizeMB}MB) exceeds the 25MB limit.`);
                e.target.value = "";
                return;
            }
            if (fieldName === 'idDocumentFront') {
                setFrontFile(file.name);
                setSizes(prev => ({ ...prev, front: newSize }));
            } else if (fieldName === 'idDocumentBack') {
                setBackFile(file.name);
                setSizes(prev => ({ ...prev, back: newSize }));
            } else if (fieldName === 'passportPhoto') {
                setPassportFile(file.name);
                setSizes(prev => ({ ...prev, passport: newSize }));
            }
        }
    };

    // --- VIEW 0: SUCCESS ---
    if (isVerified) {
        return (
            <div className={styles.modalOverlay}>
                <div className={styles.modalCard}>
                    <div className={styles.modalIcon}>
                        <Check size={40} strokeWidth={3} />
                    </div>
                    <h2 className={styles.modalTitle}>Email Verified!</h2>
                    <p className={styles.modalText}>Your account has been successfully activated.</p>
                    <span className={styles.timerRing}>
                        Redirecting to Login in {countdown}s...
                    </span>
                    <button
                        onClick={() => {
                            const dest = callbackUrl
                                ? `/login?verified=true&callbackUrl=${encodeURIComponent(callbackUrl)}`
                                : '/login?verified=true';
                            router.push(dest);
                        }}
                        className={`${styles.primaryBtn} ${styles.fullWidthBtn}`}
                    >
                        Go to Login Now
                    </button>
                </div>
            </div>
        );
    }

    // --- VIEW 1: OTP VERIFICATION ---
    if (showOtp) {
        return (
            <div className={styles.pageWrapper}>
                <div className={styles.successCard}>
                    <div className={`${styles.successIcon} ${styles.otpIconWrapper}`}>
                        <Mail size={40} />
                    </div>
                    <h1 className={styles.successCardTitle}>Verify Your Email</h1>
                    <p className={styles.successCardText}>We sent a 6-digit code to  <strong>{state.email}</strong></p>
                    <p className={styles.otpSubText}>
                        Enter the code below to activate your account.
                    </p>
                    <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        className={styles.otpInput}
                    />
                    {otpError && (
                        <div className={styles.otpError}>
                            <AlertCircle size={16} /> {otpError}
                        </div>
                    )}
                    <button
                        onClick={handleVerify}
                        disabled={isVerifying}
                        className={`${styles.primaryBtn} ${styles.fullWidthBtn}`}
                    >
                        {isVerifying ? <><Loader2 className={styles.spin} /> Verifying...</> : 'Verify & Activate'}
                    </button>

                    <div className={styles.resendContainer}>
                        <span className={styles.resendText}>Code expired or didn&apos;t receive it? </span>
                        <Link
                            href={`/verify-email?email=${encodeURIComponent(state.email || "")}${callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
                            className={styles.resendLink}
                        >
                            Request a new code
                        </Link>
                    </div>
                    <button onClick={() => setShowOtp(false)} className={styles.backBtn}>
                        Incorrect email? Go back
                    </button>
                </div>
            </div>
        );
    }

    // --- VIEW 3: REGISTRATION FORM ---
    return (
        <div className={styles.pageWrapper}>
            <div className={styles.ambientMesh}></div>
            <div className={styles.formContainer}>
                <div className={styles.header}>
                    <h1 className={styles.headerTitle}>Secure Onboarding</h1>
                    <p className={styles.headerSubTitle}>Complete your profile to access {siteName} Enterprise.</p>
                </div>
                <form action={handleFormSubmit} className={styles.glassForm}>
                    <input type="hidden" name="callbackUrl" value={callbackUrl} />
                    {(state?.message && !state.success) && (
                        <div className={styles.errorBanner}>
                            <AlertCircle size={20} />
                            <span>{state.message}</span>
                        </div>
                    )}
                    {fileError && (
                        <div className={`${styles.errorBanner} ${styles.errorBannerDanger}`}>
                            <AlertCircle size={20} />
                            <span>{fileError}</span>
                        </div>
                    )}

                    <div className={styles.splitLayout}>
                        <div className={styles.colLeft}>
                            <div className={styles.sectionLabel}>
                                <Camera size={16} /> <span>Profile Photo</span>
                            </div>
                            <div className={styles.fieldGroup}>
                                <div className={styles.photoUploadRow}>
                                    <div className={styles.previewCircle}>
                                        {passportFile ? <User size={32} color="var(--success)" /> : <User size={32} className={styles.placeholderIcon} />}
                                    </div>
                                    <div className={styles.photoInputWrapper}>
                                        <label>Upload Passport / Selfie</label>
                                        <input type="file" name="passportPhoto" accept="image/*" className={styles.fileInput} onChange={handleFileChange} />
                                        <span className={styles.fileHint}>
                                            {passportFile ? <span className={styles.successText}>{passportFile}</span> : "Set as Profile Picture (Max 10MB)"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className={`${styles.sectionLabel} ${styles.mt4}`}>
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

                            <div className={`${styles.sectionLabel} ${styles.mt4}`}>
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

                                <div className={styles.inputWrapper} style={{ marginTop: '1rem' }}>
                                    <label className={styles.labelHighlight}>
                                        <Wallet size={14} className={styles.wallet} />
                                        Primary Account Currency
                                    </label>
                                    <select name="currency" required defaultValue="USD" className={styles.selectHighlight}>
                                        <option value="USD">🇺🇸 USD - United States Dollar</option>
                                        <option value="EUR">🇪🇺 EUR - Euro</option>
                                        <option value="GBP">🇬🇧 GBP - British Pound</option>
                                        <option value="ZAR">🇿🇦 ZAR - South African Rand</option>
                                        <option value="CAD">🇨🇦 CAD - Canadian Dollar</option>
                                        <option value="AUD">🇦🇺 AUD - Australian Dollar</option>
                                        <option value="CHF">🇨🇭 CHF - Swiss Franc</option>
                                        <option value="CNY">🇨🇳 CNY - Chinese Yuan</option>
                                        <option value="JPY">🇯🇵 JPY - Japanese Yen</option>
                                        <option value="INR">🇮🇳 INR - Indian Rupee</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className={styles.colRight}>
                            <div className={styles.sectionLabel}>
                                <MapPin size={16} /> <span>Residency & Next of Kin</span>
                            </div>
                            <div className={styles.fieldGroup}>
                                <div className={styles.inputWrapper}>
                                    <label>Street Address</label>
                                    <input name="address" placeholder="1234 Wall Street, Penthouse 4" />
                                </div>

                                <div className={styles.grid2}>
                                    <div className={styles.inputWrapper}>
                                        <label>City</label>
                                        <input name="city" placeholder="City" />
                                    </div>
                                    <div className={styles.inputWrapper}>
                                        <label>State / Province</label>
                                        <input name="state" placeholder="State" />
                                    </div>
                                </div>

                                <div className={styles.grid2}>
                                    <div className={styles.inputWrapper}>
                                        <label>Zip Code</label>
                                        <input name="zipCode" defaultValue="99950" />
                                    </div>
                                    <div className={styles.inputWrapper}>
                                        <label>Country of Residence</label>
                                        <input name="country" placeholder="e.g. US, Germany, China" required />
                                    </div>
                                </div>

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

                            <div className={`${styles.sectionLabel} ${styles.mt4}`}>
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

                                <div className={styles.uploadGrid}>
                                    {/* FRONT SIDE UPLOAD */}
                                    <div className={styles.dropZone}>
                                        <input type="file" name="idDocumentFront" className={styles.fileInput} onChange={handleFileChange} />
                                        <div className={styles.dropContent}>
                                            <div className={styles.cloudIcon}><UploadCloud size={24} /></div>
                                            {frontFile ? (
                                                <div className={styles.fileSuccess}><span>Front: {frontFile}</span><CheckCircle size={16} /></div>
                                            ) : (
                                                <div className={styles.uploadText}>
                                                    <span className={styles.mainText}>Upload ID (FRONT)</span>
                                                    <span className={styles.subText}>PNG, JPG or PDF</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* BACK SIDE UPLOAD */}
                                    <div className={styles.dropZone}>
                                        <input type="file" name="idDocumentBack" className={styles.fileInput} onChange={handleFileChange} />
                                        <div className={styles.dropContent}>
                                            <div className={styles.cloudIcon}><UploadCloud size={24} /></div>
                                            {backFile ? (
                                                <div className={styles.fileSuccess}><span>Back: {backFile}</span><CheckCircle size={16} /></div>
                                            ) : (
                                                <div className={styles.uploadText}>
                                                    <span className={styles.mainText}>Upload ID (BACK)</span>
                                                    <span className={styles.subText}>PNG, JPG or PDF</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <p className={styles.complianceNote}>
                                    Both sides are required for KYC compliance.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <button disabled={isPending} className={styles.primaryBtn}>
                            {isPending ? 'Verifying Identity...' : 'Submit Application'}
                            {!isPending && <ArrowRight size={18} />}
                        </button>
                        <p className={styles.legalText}>By creating an account, you agree to {siteName}&apos;s Terms of Service.</p>
                        <div className={styles.loginLink}>
                            Already have an account? <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}>Sign In</Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}