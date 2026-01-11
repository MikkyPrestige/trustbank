'use client';

import { useState, useTransition } from 'react';
import { Lock, Globe, Smartphone } from 'lucide-react';
import { toggleCardFreeze } from '@/actions/cards';
import styles from './cards.module.css';
import toast from 'react-hot-toast';

export default function CardControls({ card }: { card: any }) {
    const [isPending, startTransition] = useTransition();

    // Local state for immediate UI feedback
    const [isFrozen, setIsFrozen] = useState(card.status === 'FROZEN');

    const handleFreezeToggle = () => {
        // Optimistic UI update
        const newFrozenState = !isFrozen;
        setIsFrozen(newFrozenState);

        startTransition(async () => {
            const result = await toggleCardFreeze(card.id, isFrozen ? 'FROZEN' : 'ACTIVE');

            if (result.success) {
                // FIX: Add fallback string '?? "Success"'
                toast.success(result.message ?? "Card status updated");
            } else {
                // Revert if failed
                setIsFrozen(!newFrozenState);
                // FIX: Add fallback string '?? "Failed"'
                toast.error(result.message ?? "Failed to update card status");
            }
        });
    };

    return (
        <div className={styles.settingsColumn}>
            <h3 className={styles.sectionTitle}>Card Security Controls</h3>

            <div className={styles.controlGrid}>
                {/* 1. FREEZE TOGGLE */}
                <div className={styles.controlCard} style={{ opacity: isPending ? 0.7 : 1 }}>
                    <div className={styles.iconBox} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                        <Lock size={22} />
                    </div>
                    <div className={styles.controlInfo}>
                        <h4>Freeze Card</h4>
                        <p>{isFrozen ? 'Card is currently locked.' : 'Temporarily disable all transactions.'}</p>
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

                {/* 2. INTERNATIONAL */}
                <div className={styles.controlCard}>
                    <div className={styles.iconBox} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                        <Globe size={22} />
                    </div>
                    <div className={styles.controlInfo}>
                        <h4>International Usage</h4>
                        <p>Allow transactions outside your country.</p>
                    </div>
                    <label className={styles.switch}>
                        <input type="checkbox" defaultChecked />
                        <span className={styles.slider}></span>
                    </label>
                </div>

                {/* 3. CONTACTLESS */}
                <div className={styles.controlCard}>
                    <div className={styles.iconBox} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                        <Smartphone size={22} />
                    </div>
                    <div className={styles.controlInfo}>
                        <h4>Contactless Payment</h4>
                        <p>Enable NFC and Tap-to-Pay.</p>
                    </div>
                    <label className={styles.switch}>
                        <input type="checkbox" defaultChecked />
                        <span className={styles.slider}></span>
                    </label>
                </div>
            </div>
        </div>
    );
}