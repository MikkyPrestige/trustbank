'use client';

import { useState } from 'react';
import { adminSetWireCode } from '@/actions/admin/wire';
import styles from './wires.module.css';
import { X, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CodeModal({ wire, onClose }: { wire: any, onClose: () => void }) {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    // Ensure we have a valid stage string (TAA, COT, IJY)
    const currentStage = wire.currentStage || 'TAA';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent form reload
        setLoading(true);

        // 👇 MATCHING YOUR SERVER ACTION (FormData)
        const formData = new FormData();
        formData.append("wireId", wire.id);
        formData.append("stage", currentStage);
        formData.append("code", code);

        try {
            const res = await adminSetWireCode(formData);

            if (res.success) {
                toast.success(res.message);
                onClose();
                window.location.reload();
            } else {
                toast.error(res.message);
            }
        } catch (err) {
            toast.error("Failed to connect to server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Set {currentStage} Code</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#aaa' }}>
                    Client is stuck at <strong>{currentStage}</strong>.
                    Set the code below.
                </div>

                <form onSubmit={handleSubmit}>
                    <input
                        className={styles.input}
                        placeholder={`Enter ${currentStage} Code...`}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                    />

                    <button disabled={loading} className={styles.saveBtn}>
                        {loading ? <Loader2 className="spin" size={20} /> : <><Save size={18} /> Save Code</>}
                    </button>
                </form>
            </div>
        </div>
    );
}