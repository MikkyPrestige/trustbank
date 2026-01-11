'use client';

import { useState } from 'react';
import { adminSetWireCode } from '@/actions/admin-wires';
import { X, Save } from 'lucide-react';
import styles from './wires.module.css'; // We'll create this CSS next

export default function CodeModal({ wire, onClose }: { wire: any, onClose: () => void }) {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    // Determine which code we are setting based on current stage
    const currentStage = wire.currentStage;

    const handleSubmit = async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append("wireId", wire.id);
        formData.append("stage", currentStage);
        formData.append("code", code);

        const res = await adminSetWireCode(formData);
        setLoading(false);

        if (res.success) {
            alert(res.message);
            onClose();
        } else {
            alert(res.message);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h3>Set {currentStage} Code</h3>
                    <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
                </div>

                <p className={styles.modalSub}>
                    Client is stuck at <strong>{currentStage}</strong>.
                    Set the code below and send it to the client.
                </p>

                <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={`Enter ${currentStage} Code...`}
                    className={styles.modalInput}
                />

                <div className={styles.modalActions}>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !code}
                        className={styles.saveBtn}
                    >
                        <Save size={16} /> Save Code
                    </button>
                </div>
            </div>
        </div>
    );
}