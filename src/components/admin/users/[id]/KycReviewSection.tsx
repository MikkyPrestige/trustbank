'use client';

import { useState, useRef } from 'react';
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { processKyc, adminUploadKyc } from '@/actions/admin/kyc';
import { Check, X, AlertTriangle, User, FileText, ShieldCheck, Ban, ExternalLink, Upload, Loader2 } from 'lucide-react';
import styles from './users.module.css';

export default function KycReviewSection({ user }: { user: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectInput, setShowRejectInput] = useState(false);

    // Upload state
    const [uploadLoading, setUploadLoading] = useState(false);
    const [passportFile, setPassportFile] = useState<File | null>(null);
    const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
    const [idBackFile, setIdBackFile] = useState<File | null>(null);
    const passportRef = useRef<HTMLInputElement>(null);
    const idFrontRef = useRef<HTMLInputElement>(null);
    const idBackRef = useRef<HTMLInputElement>(null);

    const isPending = user.kycStatus === 'PENDING';
    const isVerified = user.kycStatus === 'VERIFIED';
    const isFailed = user.kycStatus === 'FAILED';
    const isNotSubmitted = user.kycStatus === 'NOT_SUBMITTED';

    const renderPreview = (url: string | null, alt: string) => {
        if (!url) return <div className={styles.placeholderBox}>No Document</div>;
        if (url.toLowerCase().includes('.pdf')) {
            return (
                <div className={styles.pdfPreview}>
                    <FileText size={48} className={styles.pdfIcon} />
                    <span className={styles.pdfLabel}>Document</span>
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.viewPdfBtn}
                    >
                        Open PDF <ExternalLink size={16} />
                    </a>
                </div>
            );
        }

        return (
            <a href={url} target="_blank" rel="noreferrer" className={styles.imageLink}>
                <Image src={url} alt={alt} fill sizes="(max-width: 768px) 100vw, 33vw" className={styles.docImage} />
            </a>
        );
    };

    const handleAction = async (decision: 'APPROVE' | 'REJECT') => {
        if (decision === 'REJECT' && !showRejectInput) {
            setShowRejectInput(true);
            return;
        }
        if (decision === 'REJECT' && !rejectReason) {
            alert("Please enter a reason for rejection.");
            return;
        }

        if (!confirm(`Are you sure you want to ${decision} this user?`)) return;

        setLoading(true);
        const res = await processKyc(user.id, decision, rejectReason);
        if (res?.success) {
            router.refresh();
        } else {
            alert(res?.message || "Error processing KYC");
            setLoading(false);
        }
    };

    const handleUpload = async () => {
        if (!passportFile || !idFrontFile || !idBackFile) {
            alert("Please select all three documents: Passport, ID Front, and ID Back.");
            return;
        }

        setUploadLoading(true);
        const fd = new FormData();
        fd.append("passport", passportFile);
        fd.append("idCardFront", idFrontFile);
        fd.append("idCardBack", idBackFile);

        const res = await adminUploadKyc(user.id, fd);
        if (res?.success) {
            router.refresh();
        } else {
            alert(res?.message || "Upload failed");
            setUploadLoading(false);
        }
    };

    const uploadForm = (
        <div className={styles.uploadSection}>
            <div className={styles.uploadGrid}>
                <div className={styles.uploadField}>
                    <p className={styles.kycLabel}>Passport Photo</p>
                    <button type="button" className={styles.filePickBtn} onClick={() => passportRef.current?.click()}>
                        <Upload size={14} />
                        {passportFile ? passportFile.name : 'Choose file'}
                    </button>
                    <input
                        ref={passportRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => setPassportFile(e.target.files?.[0] || null)}
                    />
                </div>
                <div className={styles.uploadField}>
                    <p className={styles.kycLabel}>ID Card – Front</p>
                    <button type="button" className={styles.filePickBtn} onClick={() => idFrontRef.current?.click()}>
                        <Upload size={14} />
                        {idFrontFile ? idFrontFile.name : 'Choose file'}
                    </button>
                    <input
                        ref={idFrontRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => setIdFrontFile(e.target.files?.[0] || null)}
                    />
                </div>
                <div className={styles.uploadField}>
                    <p className={styles.kycLabel}>ID Card – Back</p>
                    <button type="button" className={styles.filePickBtn} onClick={() => idBackRef.current?.click()}>
                        <Upload size={14} />
                        {idBackFile ? idBackFile.name : 'Choose file'}
                    </button>
                    <input
                        ref={idBackRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => setIdBackFile(e.target.files?.[0] || null)}
                    />
                </div>
            </div>
            <button
                className={`${styles.btnApprove} ${uploadLoading ? styles.btnDisabled : ''}`}
                onClick={handleUpload}
                disabled={uploadLoading || !passportFile || !idFrontFile || !idBackFile}
            >
                {uploadLoading ? <Loader2 size={18} className={styles.spin} /> : <Upload size={18} />}
                {uploadLoading ? 'Uploading...' : 'Upload & Verify'}
            </button>
        </div>
    );

    // NOT_SUBMITTED: show upload form only
    if (isNotSubmitted) {
        return (
            <div className={styles.kycContainer}>
                <div className={styles.kycHeader}>
                    <h3 className={styles.kycTitle}>
                        <Upload size={20} className={styles.labelIcon} /> Upload KYC Documents
                    </h3>
                    <span className={`${styles.kycBadge} ${styles.NOT_SUBMITTED}`}>NOT SUBMITTED</span>
                </div>
                <p className={styles.uploadNote}>
                    This user has not submitted KYC documents. You can upload on their behalf and they will be verified immediately.
                </p>
                {uploadForm}
            </div>
        );
    }

    return (
        <div className={styles.kycContainer}>
            <div className={styles.kycHeader}>
                <h3 className={styles.kycTitle}>
                    {isPending && <><AlertTriangle size={20} className={styles.textYellow} />KYC Review</>}
                    {isVerified && <><ShieldCheck size={20} className={styles.textGreen} /> KYC Documents</>}
                    {isFailed && <><Ban size={20} className={styles.textRed} /> Rejected Documents</>}
                </h3>

                <span className={`${styles.kycBadge} ${styles[user.kycStatus]}`}>
                    {user.kycStatus}
                </span>
            </div>

            <div className={styles.kycGrid}>
                <div className={styles.kycCard}>
                    <p className={styles.kycLabel}>Passport</p>
                    <div className={styles.imgBox}>
                        {user.passportUrl || user.image ? (
                            <a href={user.passportUrl || user.image} target="_blank" rel="noreferrer" className={styles.imageLink}>
                                <Image
                                    src={user.passportUrl || user.image}
                                    alt="Passport"
                                    fill
                                    className={styles.docImage}
                                />
                            </a>
                        ) : (
                            <User size={32} className={styles.placeholderIcon} />
                        )}
                    </div>
                </div>

                <div className={styles.kycCard}>
                    <p className={styles.kycLabel}>ID Front</p>
                    <div className={styles.imgBox}>
                        {renderPreview(user.idCardUrl, "ID Front")}
                    </div>
                </div>

                <div className={styles.kycCard}>
                    <p className={styles.kycLabel}>ID Back</p>
                    <div className={styles.imgBox}>
                        {renderPreview(user.idCardBackUrl, "ID Back")}
                    </div>
                </div>
            </div>

            {isPending && (
                <>
                    {showRejectInput && (
                        <input
                            className={styles.kycInput}
                            placeholder="Reason for rejection..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            autoFocus
                        />
                    )}

                    <div className={styles.kycActions}>
                        <button
                            className={`${styles.btnApprove} ${loading ? styles.btnDisabled : ''}`}
                            onClick={() => handleAction('APPROVE')}
                            disabled={loading}
                        >
                            <Check size={20} /> Approve
                        </button>
                        <button
                            className={`${styles.btnReject} ${loading ? styles.btnDisabled : ''}`}
                            onClick={() => handleAction('REJECT')}
                            disabled={loading}
                        >
                            <X size={20} /> Reject
                        </button>
                    </div>
                </>
            )}

            {isFailed && user.kycRejectionReason && (
                <div className={styles.rejectionReason}>
                    <strong>Rejection Reason:</strong> {user.kycRejectionReason}
                </div>
            )}

            {isFailed && (
                <div className={styles.reuploadSection}>
                    <p className={styles.uploadNote}>Re-upload documents on behalf of this user:</p>
                    {uploadForm}
                </div>
            )}
        </div>
    );
}
