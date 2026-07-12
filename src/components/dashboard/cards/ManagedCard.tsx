'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import VirtualCard from './VirtualCard';
import { Ban, Unlock, ShieldAlert } from 'lucide-react';
import styles from './cards.module.css';
import { toggleCardFreeze } from '@/actions/user/cards';
import toast from 'react-hot-toast';

interface Card {
    id: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    status: string;
    type: string;
    adminLocked?: boolean;
    adminLockReason?: string | null;
}

interface ManagedCardProps {
    card: Card;
    userName: string;
    siteName?: string;
}

export default function ManagedCard({ card, userName, siteName }: ManagedCardProps) {
    const [currentStatus, setCurrentStatus] = useState<string>(card.status);
    const [isPending, startTransition] = useTransition();

    const isFrozen = currentStatus === 'FROZEN' || currentStatus === 'BLOCKED';
    const isAdminLocked = !!card.adminLocked;

    const handleToggle = () => {
        if (isAdminLocked) {
            toast.error("This card was frozen by an administrator. Please contact support to unlock it.");
            return;
        }

        const statusBeforeToggle = currentStatus;

        const nextStatus = isFrozen ? 'ACTIVE' : 'BLOCKED';

        setCurrentStatus(nextStatus);

        startTransition(async () => {
            try {
                const result = await toggleCardFreeze(card.id);

                if (result.success) {
                    toast.success(result.message || (nextStatus === 'ACTIVE' ? "Card Unfrozen" : "Card Frozen"));
                } else {
                    throw new Error(result.message || "Action failed");
                }
            } catch (error: any) {
                setCurrentStatus(statusBeforeToggle);
                toast.error(error.message || "Failed to update status");
            }
        });
    };

    return (
        <div className={styles.cardColumn}>
            <VirtualCard
                card={card}
                userName={userName}
                overrideStatus={isFrozen ? 'FROZEN' : 'ACTIVE'}
                siteName={siteName}
            />

            <div className={styles.statusWrapper}>
                <span className={`${styles.statusPill} ${isFrozen ? styles.frozenPill : styles.activePill}`}>
                    <span className={styles.statusDot}></span>
                    {isAdminLocked ? 'Locked by Admin' : isFrozen ? 'Frozen' : 'Active'}
                </span>
            </div>

            {isAdminLocked ? (
                <div className={`${styles.controlCard} ${styles.activeFreeze}`}>
                    <div className={styles.controlHeader}>
                        <div className={styles.flexGap}>
                            <div className={styles.iconBox} style={{ background: 'rgba(var(--danger-rgb), 0.1)', color: 'var(--danger)' }}>
                                <ShieldAlert size={22} />
                            </div>
                            <div className={styles.controlInfo}>
                                <h4>Frozen by Administrator</h4>
                                <p>{card.adminLockReason || "This card was locked for security reasons."} Contact support to unlock it.</p>
                            </div>
                        </div>
                    </div>
                    <Link href="/dashboard/support" className={styles.verifyBtn}>Contact Support</Link>
                </div>
            ) : (
                <div className={`${styles.controlCard} ${isFrozen ? styles.activeFreeze : ''}`}>
                    <div className={styles.controlHeader}>
                        <div className={styles.flexGap}>
                            <div className={styles.iconBox} style={{
                                background: isFrozen ? 'rgba(var(--danger-rgb), 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                color: isFrozen ? 'var(--danger)' : 'var(--text-main)'
                            }}>
                                {isFrozen ? <Ban size={22} /> : <Unlock size={22} />}
                            </div>
                            <div className={styles.controlInfo}>
                                <h4>{isFrozen ? 'Card Frozen' : 'Freeze Card'}</h4>
                                <p>{isFrozen ? 'Unfreeze to use card.' : 'Temporarily lock this card.'}</p>
                            </div>
                        </div>

                        <label className={styles.switch}>
                            <input
                                type="checkbox"
                                checked={isFrozen}
                                onChange={handleToggle}
                                disabled={isPending}
                            />
                            <span className={styles.slider}></span>
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
}