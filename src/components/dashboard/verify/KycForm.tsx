'use client';

import { useActionState, useState, useEffect, startTransition } from 'react';
import { submitKyc } from '@/actions/user/kyc';
import { Check, Image as ImageIcon, UploadCloud, Loader2, AlertCircle, FileText } from 'lucide-react';
import styles from "./verify.module.css";
import toast from 'react-hot-toast';

const initialState = { message: '', success: false };
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function KycForm() {
    const [state, dispatch, isPending] = useActionState(submitKyc, initialState);

    // Visual State
    const [passportName, setPassportName] = useState('');
    const [idFrontName, setIdFrontName] = useState('');
    const [idBackName, setIdBackName] = useState('');
    const [clientError, setClientError] = useState<string | null>(null);

    useEffect(() => {
        if (state?.message) {
            if (state.success) {
                toast.success(state.message);
            } else if (!clientError) {
                toast.error(state.message);
            }
        }
    }, [state, clientError]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (name: string) => void) => {
        const file = e.target.files?.[0];
        setClientError(null);

        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                setClientError(`File too large: ${file.name}. Max limit is 10MB.`);
                e.target.value = "";
                setter("");
                return;
            }
            setter(file.name);
        } else {
            setter("");
        }
    };

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const passport = formData.get("passport") as File;
        const front = formData.get("idCardFront") as File;
        const back = formData.get("idCardBack") as File;

        const missingFields = [];
        if (!passport || passport.size === 0) missingFields.push("Passport Photo");
        if (!front || front.size === 0) missingFields.push("ID Front");
        if (!back || back.size === 0) missingFields.push("ID Back");

        if (missingFields.length > 0) {
            setClientError(`Missing: ${missingFields.join(', ')}. Please upload all documents.`);
            return;
        }

        setClientError(null);

        startTransition(() => {
            dispatch(formData);
        });
    };

    const displayError = clientError || (!state.success && state.message ? state.message : null);

    return (
        <form onSubmit={onSubmit} className={styles.formGrid}>

            {displayError && (
                <div className={styles.errorBanner}>
                    <AlertCircle size={20} />
                    <span>{displayError}</span>
                </div>
            )}

            {/* --- PASSPORT --- */}
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
                                <p className={styles.dropText}>Upload Passport Photo</p>
                                <span className={styles.formatText}>Clear headshot (JPG/PNG)</span>
                            </>
                        )}
                    </div>
                </label>
            </div>

            {/* --- ID CARDS --- */}
            <div className={styles.uploadCard}>
                <div className={styles.cardHeader}>
                    <span className={styles.stepNum}>2</span>
                    <span className={styles.stepTitle}>Government Issued ID</span>
                </div>

                <div className={styles.idGrid}>
                    {/* Front */}
                    <div className={styles.idUploadBox}>
                        <p className={styles.subLabel}>Front Side</p>
                        <label className={`${styles.dropzone} ${styles.smallDrop} ${idFrontName ? styles.active : ''}`}>
                            <input
                                type="file"
                                name="idCardFront"
                                accept="image/png, image/jpeg, application/pdf"
                                hidden
                                onChange={(e) => handleFileChange(e, setIdFrontName)}
                            />
                            <div className={styles.dropContent}>
                                {idFrontName ? (
                                    <div className={styles.fileSuccess}>
                                        <div className={styles.checkBadge}><Check size={16} /></div>
                                        <p className={styles.fileName}>{idFrontName}</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className={styles.iconCircle}><UploadCloud size={20} /></div>
                                        <p className={styles.dropText}>Upload Front</p>
                                    </>
                                )}
                            </div>
                        </label>
                    </div>

                    {/* Back */}
                    <div className={styles.idUploadBox}>
                        <p className={styles.subLabel}>Back Side</p>
                        <label className={`${styles.dropzone} ${styles.smallDrop} ${idBackName ? styles.active : ''}`}>
                            <input
                                type="file"
                                name="idCardBack"
                                accept="image/png, image/jpeg, application/pdf"
                                hidden
                                onChange={(e) => handleFileChange(e, setIdBackName)}
                            />
                            <div className={styles.dropContent}>
                                {idBackName ? (
                                    <div className={styles.fileSuccess}>
                                        <div className={styles.checkBadge}><Check size={16} /></div>
                                        <p className={styles.fileName}>{idBackName}</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className={styles.iconCircle}><FileText size={20} /></div>
                                        <p className={styles.dropText}>Upload Back</p>
                                    </>
                                )}
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            <div className={styles.actionRow}>
                <button type="submit" disabled={isPending} className={styles.submitBtn}>
                    {isPending ? (
                        <> <Loader2 className={styles.spin} size={20} /> Uploading Documents... </>
                    ) : (
                        "Submit for Verification"
                    )}
                </button>
            </div>
        </form>
    );
}