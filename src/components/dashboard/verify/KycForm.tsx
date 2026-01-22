'use client';

import { useActionState, useState, useEffect } from 'react';
import { submitKyc } from '@/actions/user/kyc';
import { Check, Image as ImageIcon, UploadCloud, Loader2, AlertCircle } from 'lucide-react';
import styles from "./verify.module.css";
import toast from 'react-hot-toast';

const initialState = { message: '', success: false };
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function KycForm() {
    const [state, action, isPending] = useActionState(submitKyc, initialState);

    // Local State for File Names
    const [passportName, setPassportName] = useState('');
    const [idName, setIdName] = useState('');
    const [clientError, setClientError] = useState<string | null>(null);

    useEffect(() => {
        if (state?.message) {
            if (state.success) {
                toast.success(state.message);
            } else {
                toast.error(state.message);
            }
        }
    }, [state]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (name: string) => void) => {
        const file = e.target.files?.[0];
        setClientError(null);

        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                setClientError(`File too large: ${file.name}. Max limit is 10MB.`);
                e.target.value = ""; // Reset input
                setter("");
                return;
            }
            setter(file.name);
        } else {
            setter("");
        }
    };

    const displayError = clientError || (!state.success ? state.message : null);

    return (
        <form action={action} className={styles.formGrid}>

            {/* Error Banner */}
            {displayError && (
                <div className={styles.errorBanner}>
                    <AlertCircle size={20} />
                    <span>{displayError}</span>
                </div>
            )}

            {/* Passport Upload (Step 1) */}
            <div className={styles.uploadCard}>
                <div className={styles.cardHeader}>
                    <span className={styles.stepNum}>1</span>
                    <span className={styles.stepTitle}>Passport Photograph</span>
                </div>
                <label className={`${styles.dropzone} ${passportName ? styles.active : ''}`}>
                    <input
                        type="file"
                        name="passport"
                        accept="image/png, image/jpeg, image/webp"
                        required
                        hidden
                        onChange={(e) => handleFileChange(e, setPassportName)}
                    />
                    <div className={styles.dropContent}>
                        {passportName ? (
                            <div className={styles.fileSuccess}>
                                <div className={styles.checkBadge}><Check size={18} /></div>
                                <p className={styles.fileName}>{passportName}</p>
                            </div>
                        ) : (
                            <>
                                <div className={styles.iconCircle}><ImageIcon size={24} /></div>
                                <p className={styles.dropText}>Click to upload Passport</p>
                                <span className={styles.formatText}>Clear headshot (JPG/PNG)</span>
                            </>
                        )}
                    </div>
                </label>
            </div>

            {/* ID Card Upload (Step 2) */}
            <div className={styles.uploadCard}>
                <div className={styles.cardHeader}>
                    <span className={styles.stepNum}>2</span>
                    <span className={styles.stepTitle}>Government Issued ID</span>
                </div>
                <label className={`${styles.dropzone} ${idName ? styles.active : ''}`}>
                    <input
                        type="file"
                        name="idCard"
                        accept="image/png, image/jpeg, application/pdf"
                        required
                        hidden
                        onChange={(e) => handleFileChange(e, setIdName)}
                    />
                    <div className={styles.dropContent}>
                        {idName ? (
                            <div className={styles.fileSuccess}>
                                <div className={styles.checkBadge}><Check size={18} /></div>
                                <p className={styles.fileName}>{idName}</p>
                            </div>
                        ) : (
                            <>
                                <div className={styles.iconCircle}><UploadCloud size={24} /></div>
                                <p className={styles.dropText}>Click to upload ID Card</p>
                                <span className={styles.formatText}>Passport or License (PDF/JPG)</span>
                            </>
                        )}
                    </div>
                </label>
            </div>

            <div className={styles.actionRow}>
                <button type="submit" disabled={isPending} className={styles.submitBtn}>
                    {isPending ? (
                        <> <Loader2 className={styles.spin} size={20} /> Securing Documents... </>
                    ) : (
                        "Submit for Review"
                    )}
                </button>
            </div>
        </form>
    );
}