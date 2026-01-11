'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './cards.module.css';

export default function VirtualCard({ card, userName }: { card: any, userName: string }) {
    const [showDetails, setShowDetails] = useState(false);

    // 1. CLEAN THE INPUT: Remove spaces/dashes first to ensure we have raw digits
    const cleanNum = card.cardNumber.replace(/\D/g, '');

    // Helper to mask number: "4242 •••• •••• 1234"
    const getMaskedNumber = (num: string) => {
        const last4 = num.slice(-4);
        const first4 = num.slice(0, 4);
        return `${first4} •••• •••• ${last4}`;
    };

    // 2. FORMATTING LOGIC: Now safely splits raw digits into groups of 4
    const displayNum = showDetails
        ? cleanNum.match(/.{1,4}/g)?.join(' ') || cleanNum // Fallback if match fails
        : getMaskedNumber(cleanNum);

    return (
        <div className={styles.visaCard}>
            <div className={styles.cardGlass}></div>

            <button
                onClick={() => setShowDetails(!showDetails)}
                className={styles.eyeBtn}
                title={showDetails ? "Hide Numbers" : "Show Numbers"}
            >
                {showDetails ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>

            <div className={styles.cardTop}>
                <span className={styles.bankName}>TrustBank</span>
                <span className={styles.cardType}>VISA</span>
            </div>

            <div className={styles.chip}></div>

            <div className={styles.cardNumber}>
                {displayNum}
            </div>

            <div className={styles.cardDetails}>
                <div className={styles.detailGroup}>
                    <span className={styles.detailLabel}>Holder</span>
                    <span className={styles.detailValue}>{userName}</span>
                </div>
                <div className={styles.detailGroup}>
                    <span className={styles.detailLabel}>Expires</span>
                    <span className={styles.detailValue}>{card.expiryDate}</span>
                </div>

                <div className={styles.detailGroup} style={{ minWidth: '40px' }}>
                    <span className={styles.detailLabel}>CVV</span>
                    <span className={styles.detailValue}>
                        {showDetails ? card.cvv : '•••'}
                    </span>
                </div>
            </div>
        </div>
    );
}