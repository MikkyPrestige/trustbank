'use client';

import { useState, useTransition } from 'react';
import VirtualCard from './VirtualCard';
import { Ban, Unlock } from 'lucide-react';
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

    const handleToggle = () => {
        const statusBeforeToggle = currentStatus;

        const nextStatus = isFrozen ? 'ACTIVE' : 'BLOCKED';

        setCurrentStatus(nextStatus);

        startTransition(async () => {
            try {
                const result = await toggleCardFreeze(card.id, statusBeforeToggle);

                if (result.success) {
                    toast.success(result.message || (nextStatus === 'ACTIVE' ? "Card Unfrozen" : "Card Frozen"));
                } else {
                    throw new Error(result.message || "Action failed");
                }
            } catch (error: any) {
                // 5. Revert on Failure
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

            {/* Status Pill */}
            <div className={styles.statusWrapper}>
                <span className={`${styles.statusPill} ${isFrozen ? styles.frozenPill : styles.activePill}`}>
                    <span className={styles.statusDot}></span>
                    {isFrozen ? 'Frozen' : 'Active'}
                </span>
            </div>

            {/* Freeze Toggle */}
            <div className={`${styles.controlCard} ${isFrozen ? styles.activeFreeze : ''}`}>
                <div className={styles.controlHeader}>
                    <div className={styles.flexGap} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className={styles.iconBox} style={{
                            background: isFrozen ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                            color: isFrozen ? '#ef4444' : 'var(--text-main)'
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
        </div>
    );
}