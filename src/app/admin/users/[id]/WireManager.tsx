'use client';

import { useState } from 'react';
import { generateClearanceCodes } from '@/actions/admin/wire';
import styles from '../users.module.css';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function WireManager({ wires }: { wires: any[] }) {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleGenerate = async (wireId: string) => {
        setLoadingId(wireId);
        await generateClearanceCodes(wireId);
        setLoadingId(null);
    };

    if (wires.length === 0) return <div className={styles.empty}>No wire history found.</div>;

    return (
        <div className={styles.wireList}>
            {wires.map((wire) => (
                <div key={wire.id} className={styles.wireItem}>
                    <div className={styles.wireInfo}>
                        <div className={styles.bankName}>{wire.bankName}</div>
                        <div className={styles.amount}>
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(wire.amount))}
                        </div>
                        <div className={styles.date}>{new Date(wire.createdAt).toLocaleDateString()}</div>
                    </div>

                    <div className={styles.wireActions}>
                        {/* Status Badge */}
                        <span className={`${styles.badge} ${wire.status === 'COMPLETED' ? styles.ACTIVE : styles.SUSPENDED}`}>
                            {wire.status}
                        </span>

                        {/* IF PENDING, SHOW GENERATOR */}
                        {wire.status === 'PENDING_AUTH' && (
                            <div className={styles.codeBox}>
                                {wire.taaCode ? (
                                    // Codes already exist
                                    <div className={styles.codesGrid}>
                                        <span>TAA: <strong>{wire.taaCode}</strong></span>
                                        <span>COT: <strong>{wire.cotCode}</strong></span>
                                        <span>IJY: <strong>{wire.ijyCode}</strong></span>
                                    </div>
                                ) : (
                                    // No codes yet -> Show Button
                                    <button
                                        onClick={() => handleGenerate(wire.id)}
                                        disabled={!!loadingId}
                                        className={styles.genBtn}
                                    >
                                        {loadingId === wire.id ? <Loader2 className={styles.spin} size={14} /> : <ShieldCheck size={14} />}
                                        Generate Clearance Codes
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}