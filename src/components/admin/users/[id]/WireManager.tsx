'use client';

import { useState } from 'react';
import { generateClearanceCodes } from '@/actions/admin/wire';
import styles from './users.module.css';
import { ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';
import { WireTransfer } from '@prisma/client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface WireManagerProps {
    wires: WireTransfer[];
    currency?: string;
    rate?: number;
}

export default function WireManager({ wires, currency = "USD", rate = 1 }: WireManagerProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const router = useRouter();

    const handleGenerate = async (wireId: string) => {
        setLoadingId(wireId);
        try {
            const res = await generateClearanceCodes(wireId);

            if (res.codes) {
                toast.success("Codes generated successfully");
                router.refresh();
            } else {
                toast.error(res.message || "Failed to generate codes");
            }
        } catch (error) {
            toast.error("Failed to generate codes");
        } finally {
            setLoadingId(null);
        }
    };

    if (wires.length === 0) return <div className={styles.emptySmall}>No wire history found.</div>;

    return (
        <div className={styles.wireList}>
            {wires.map((wire) => {
                const isActive = wire.status === 'ON_HOLD';
                const isWaiting = wire.status === 'PENDING_AUTH';
                const isCompleted = wire.status === 'COMPLETED';
                const displayAmount = Number(wire.amount) * rate;

                return (
                    <div key={wire.id} className={styles.wireItem}>
                        <div className={styles.wireInfo}>
                            <div className={styles.bankName}>{wire.bankName}</div>
                            <div className={styles.amount}>
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(displayAmount)}
                            </div>
                            {currency !== "USD" && (
                                <div className={styles.sysAmount}>
                                    Sys: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(wire.amount))}
                                </div>
                            )}
                            <div className={styles.date}>{new Date(wire.createdAt).toLocaleDateString()}</div>
                        </div>

                        <div className={styles.wireActions}>
                            <span className={`${styles.badge} ${isCompleted ? styles.badgeGreen :
                                isActive ? styles.badgeYellow :
                                    isWaiting ? styles.badgeBlue :
                                        styles.badgeRed
                                }`}>
                                {isActive ? `PENDING (${wire.currentStage})` :
                                    isWaiting ? 'WAITING APPROVAL' :
                                        wire.status}
                            </span>

                            {(isActive || isWaiting) && (
                                <div className={styles.codeBox}>
                                    {wire.taaCode ? (
                                        <div className={styles.codesGrid}>
                                            <span>TAA: <strong>{wire.taaCode}</strong></span>
                                            <span>COT: <strong>{wire.cotCode}</strong></span>
                                            <span>IMF: <strong>{wire.imfCode}</strong></span>
                                            <span>IJY: <strong>{wire.ijyCode}</strong></span>
                                        </div>
                                    ) : (
                                        isActive && (
                                            <button
                                                onClick={() => handleGenerate(wire.id)}
                                                disabled={!!loadingId}
                                                className={styles.genBtn}
                                            >
                                                {loadingId === wire.id ? <Loader2 className={styles.spin} size={14} /> : <ShieldCheck size={16} />}
                                                Generate Codes
                                            </button>
                                        )
                                    )}
                                </div>
                            )}

                            {isWaiting && (
                                <div className={styles.clearanceNotice}>
                                    <CheckCircle2 size={12} />
                                    User completed clearance. Approve in Dashboard.
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}