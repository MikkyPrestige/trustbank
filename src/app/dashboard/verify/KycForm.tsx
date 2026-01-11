'use client';

import { useActionState, useState, useEffect } from 'react';
import { submitKyc } from '@/actions/kyc';
import { Check, Image as ImageIcon, FileText, Loader2 } from 'lucide-react';
import styles from "./verify.module.css";
import toast from 'react-hot-toast';

const initialState = { message: '', success: false };

export default function KycForm() {
    const [state, action, isPending] = useActionState(submitKyc, initialState);

    // UI States for file selection visual feedback
    const [passportName, setPassportName] = useState('');
    const [idName, setIdName] = useState('');

    // 👇 WATCH FOR SERVER RESPONSE
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

    return (
        <form action={action} className={styles.formCard}>
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
                        onChange={(e) => setPassportName(e.target.files?.[0]?.name || '')}
                    />
                    <div className={styles.dropContent}>
                        {passportName ? (
                            <>
                                <div style={{ background: '#22c55e', padding: '10px', borderRadius: '50%', color: '#fff' }}>
                                    <Check size={24} />
                                </div>
                                <p style={{ color: '#fff', fontWeight: 'bold' }}>{passportName}</p>
                                <span style={{ fontSize: '0.8rem', color: '#22c55e' }}>File Selected</span>
                            </>
                        ) : (
                            <>
                                <div style={{ background: '#1a1a1a', padding: '15px', borderRadius: '50%' }}>
                                    <ImageIcon size={28} color="#666" />
                                </div>
                                <p>Drag & Drop or Click to Upload</p>
                                <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>JPG, PNG (Max 5MB)</span>
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
                        onChange={(e) => setIdName(e.target.files?.[0]?.name || '')}
                    />
                    <div className={styles.dropContent}>
                        {idName ? (
                            <>
                                <div style={{ background: '#22c55e', padding: '10px', borderRadius: '50%', color: '#fff' }}>
                                    <Check size={24} />
                                </div>
                                <p style={{ color: '#fff', fontWeight: 'bold' }}>{idName}</p>
                                <span style={{ fontSize: '0.8rem', color: '#22c55e' }}>File Selected</span>
                            </>
                        ) : (
                            <>
                                <div style={{ background: '#1a1a1a', padding: '15px', borderRadius: '50%' }}>
                                    <FileText size={28} color="#666" />
                                </div>
                                <p>Drag & Drop or Click to Upload</p>
                                <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>PDF, JPG, PNG (Max 5MB)</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <button disabled={isPending} className={styles.submitBtn}>
                {isPending ? <><Loader2 className="spin" size={20} /> Uploading...</> : 'Submit Documents'}
            </button>
        </form>
    );
}