'use client';

import { useState } from 'react';
import { useRouter } from "next/navigation";
import { adminSetWireCode } from '@/actions/admin/wire';
import styles from './wires.module.css';
import { X, Save, Loader2, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { WireTransfer } from '@prisma/client';

export default function CodeModal({ wire, onClose }: { wire: WireTransfer, onClose: () => void }) {
    const router = useRouter();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const currentStage = wire.currentStage || 'TAA';
    const isReadyForApproval = currentStage === 'PENDING_APPROVAL' || currentStage === 'COMPLETE' || currentStage === 'PENDING_AUTH';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("wireId", wire.id);
        formData.append("stage", currentStage);
        formData.append("code", code);

        try {
            const res = await adminSetWireCode(formData);
            if (res.success) {
                toast.success(res.message);
                onClose();
                router.refresh();
            } else {
                toast.error(res.message);
            }
        } catch (err) {
            toast.error("Connection failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <h3>
                        {isReadyForApproval ? "Clearance Complete" : `Set ${currentStage} Code`}
                    </h3>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={24} />
                    </button>
                </div>

                {isReadyForApproval ? (
                    // --- STATE A: READY FOR APPROVAL (No Input) ---
                    <div className={styles.modalContentCenter}>
                        <div className={styles.successIconWrapper}>
                            <ShieldCheck size={40} />
                        </div>
                        <h4 className={styles.modalTitle}>All Codes Passed</h4>
                        <p className={styles.modalText}>
                            The user has successfully entered all required clearance codes.
                            This transaction is now ready for final settlement.
                        </p>
                        <div className={styles.infoBox}>
                            <CheckCircle size={30} className={styles.infoIcon} />
                            <p className={styles.infoText}>Close this window and click the <strong>Green Approve Button</strong> to finalize.</p>
                        </div>
                        <button onClick={onClose} className={styles.btnSecondary}>
                            Close
                        </button>
                    </div>
                ) : (
                    // --- STATE B: INPUT FORM (Enter Code) ---
                        <div className={styles.modalContentCenter}>
                        <div className={styles.infoBox}>
                            <AlertTriangle size={30} className={styles.infoIcon} />
                            <p className={styles.infoText}>Client is stuck at <strong>{currentStage}</strong>. Provide the clearance code below to unblock them.</p>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <input
                                className={styles.input}
                                placeholder={`Enter ${currentStage} Code (e.g. 1234)`}
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                                autoFocus
                            />

                            <button disabled={loading} className={styles.saveBtn}>
                                {loading ? <Loader2 className={styles.spin} size={20} /> : <><Save size={18} /> Update Code</>}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}