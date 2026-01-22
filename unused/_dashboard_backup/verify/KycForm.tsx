'use client';

import { useActionState, useState, useEffect } from 'react';
import { submitKyc } from '@/actions/user/kyc';
import { Check, Image as ImageIcon, FileText, Loader2, AlertTriangle } from 'lucide-react';
import styles from "./verify.module.css";
import toast from 'react-hot-toast';

const initialState = { message: '', success: false };

const MAX_FILE_SIZE = 5 * 1024 * 1024;    // 5MB

export default function KycForm() {
    const [state, action, isPending] = useActionState(submitKyc, initialState);
    const [passportName, setPassportName] = useState('');
    const [idName, setIdName] = useState('');
    const [fileError, setFileError] = useState<string | null>(null);

    useEffect(() => {
        if (state?.message) {
            if (state.success) {
                toast.success(state.message);
                setTimeout(() => window.location.reload(), 2000);
            } else {
                toast.error(state.message);
            }
        }
    }, [state]);

    const validateAndSet = (e: React.ChangeEvent<HTMLInputElement>, setName: (name: string) => void) => {
        const file = e.target.files?.[0];
        setFileError(null);

        if (file) {
            // Check Size
            if (file.size > MAX_FILE_SIZE) {
                setFileError(`File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max allowed is 5MB.`);
                e.target.value = "";
                setName("");
                return;
            }
            setName(file.name);
        } else {
            setName("");
        }
    };

    return (
        <form action={action} className={styles.formCard}>

            {fileError && (
                <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.9rem',
                    fontWeight: 500
                }}>
                    <AlertTriangle size={18} /> {fileError}
                </div>
            )}

            {/* PASSPORT UPLOAD */}
            <div className={styles.uploadGroup}>
                <label className={styles.label}>1. Passport Photograph</label>
                <div className={`${styles.dropzone} ${passportName ? styles.fileSelected : ''}`}>
                    <input
                        type="file"
                        name="passport"
                        accept="image/*"
                        required
                        className={styles.fileInput}
                        onChange={(e) => validateAndSet(e, setPassportName)}
                    />
                    <div className={styles.dropContent}>
                        {passportName ? (
                            <>
                                <div className={styles.iconCircleSuccess}><Check size={24} /></div>
                                <p className={styles.fileName}>{passportName}</p>
                                <span className={styles.fileLabel}>File Selected</span>
                            </>
                        ) : (
                            <>
                                <div className={styles.iconCircleDefault}><ImageIcon size={28} color="#666" /></div>
                                <p className={styles.dropText}>Drag & Drop or Click to Upload</p>
                                <span className={styles.fileHint}>JPG, PNG (Max 5MB)</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ID CARD UPLOAD */}
            <div className={styles.uploadGroup}>
                <label className={styles.label}>2. Government ID (Front & Back)</label>
                <div className={`${styles.dropzone} ${idName ? styles.fileSelected : ''}`}>
                    <input
                        type="file"
                        name="idCard"
                        accept="image/*,application/pdf"
                        required
                        className={styles.fileInput}
                        onChange={(e) => validateAndSet(e, setIdName)}
                    />
                    <div className={styles.dropContent}>
                        {idName ? (
                            <>
                                <div className={styles.iconCircleSuccess}><Check size={24} /></div>
                                <p className={styles.fileName}>{idName}</p>
                                <span className={styles.fileLabel}>File Selected</span>
                            </>
                        ) : (
                            <>
                                <div className={styles.iconCircleDefault}><FileText size={28} color="#666" /></div>
                                <p className={styles.dropText}>Drag & Drop or Click to Upload</p>
                                <span className={styles.fileHint}>PDF, JPG, PNG (Max 5MB)</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <button disabled={isPending || !!fileError} className={styles.submitBtn}>
                {isPending ? <><Loader2 className={styles.spin} size={20} /> Uploading...</> : 'Submit Documents'}
            </button>
        </form>
    );
}