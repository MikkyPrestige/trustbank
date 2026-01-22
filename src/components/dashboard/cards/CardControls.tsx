'use client';

import { Globe, Smartphone } from 'lucide-react';
import styles from './cards.module.css';

interface Card {
    id: string;
    status: string;
    type: string;
}

export default function CardControls({ card }: { card: Card }) {
    return (
        <div className={styles.controlsWrapper}>
            <div className={styles.sectionHeader}>
                <h3>Card Settings</h3>
                <p>Manage limits and security features.</p>
            </div>

            <div className={styles.controlGrid}>

                {/* 1. INTERNATIONAL (Visual Toggle Only) */}
                <div className={styles.controlCard}>
                    <div className={styles.controlHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div className={styles.iconBox} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                                <Globe size={22} />
                            </div>
                            <div className={styles.controlInfo}>
                                <h4>Global Usage</h4>
                                <p>Allow payments outside home country.</p>
                            </div>
                        </div>
                        <label className={styles.switch}>
                            <input type="checkbox" defaultChecked />
                            <span className={styles.slider}></span>
                        </label>
                    </div>
                </div>

                {/* 2. CONTACTLESS (Visual Toggle Only) */}
                <div className={styles.controlCard}>
                    <div className={styles.controlHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div className={styles.iconBox} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                                <Smartphone size={22} />
                            </div>
                            <div className={styles.controlInfo}>
                                <h4>Contactless</h4>
                                <p>Enable Tap-to-Pay and NFC payments.</p>
                            </div>
                        </div>
                        <label className={styles.switch}>
                            <input type="checkbox" defaultChecked />
                            <span className={styles.slider}></span>
                        </label>
                    </div>
                </div>

            </div>
        </div>
    );
}