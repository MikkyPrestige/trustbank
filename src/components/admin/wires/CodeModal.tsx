'use client';

import { useState } from 'react';
import { useRouter } from "next/navigation";
import { adminSetWireCode } from '@/actions/admin/wire';
import styles from './wires.module.css';
import { X, Save, Loader2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { WireTransfer } from '@prisma/client';

export default function CodeModal({ wire, onClose }: { wire: WireTransfer, onClose: () => void }) {
     const router = useRouter();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const currentStage = wire.currentStage || 'TAA';

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
                    <h3>Set {currentStage} Code</h3>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.infoBox}>
                    <AlertTriangle size={16} />
                    <p>Client is stuck at <strong>{currentStage}</strong>. Provide the clearance code below to unblock them.</p>
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
        </div>
    );
}