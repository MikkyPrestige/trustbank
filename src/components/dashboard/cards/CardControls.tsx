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
                <div className={styles.controlCard}>
                    <div className={styles.controlHeader}>
                        <div className={styles.flexGap}>
                            <div className={styles.iconBox} style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
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

                <div className={styles.controlCard}>
                    <div className={styles.controlHeader}>
                        <div className={styles.flexGap}>
                            <div className={styles.iconBox} style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' }}>
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