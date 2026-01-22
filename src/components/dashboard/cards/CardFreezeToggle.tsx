'use client';

import { useState, useTransition } from 'react';
import { Lock, Ban, Unlock } from 'lucide-react';
import { toggleCardFreeze } from '@/actions/user/cards';
import styles from './cards.module.css';
import toast from 'react-hot-toast';

interface Card {
    id: string;
    status: string; // 'ACTIVE' | 'FROZEN'
    type: string;
}

export default function CardFreezeToggle({ card }: { card: Card }) {
    const [isPending, startTransition] = useTransition();
    const [isFrozen, setIsFrozen] = useState(card.status === 'FROZEN');

    const handleFreezeToggle = () => {
        const newFrozenState = !isFrozen;
        setIsFrozen(newFrozenState); // Optimistic UI Update

        startTransition(async () => {
            try {
                // Assuming toggleCardFreeze accepts string enums 'FROZEN' | 'ACTIVE'
                const result = await toggleCardFreeze(card.id, newFrozenState ? 'FROZEN' : 'ACTIVE');

                if (result.success) {
                    toast.success(result.message ?? (newFrozenState ? "Card Frozen" : "Card Activated"));
                } else {
                    throw new Error(result.message);
                }
            } catch (error: any) {
                setIsFrozen(!newFrozenState); // Revert on failure
                toast.error(error.message || "Failed to update status");
            }
        });
    };

    return (
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
                        onChange={handleFreezeToggle}
                        disabled={isPending}
                    />
                    <span className={styles.slider}></span>
                </label>
            </div>
        </div>
    );
}