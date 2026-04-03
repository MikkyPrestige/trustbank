'use client';

import { useState } from 'react';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';
import styles from './cards.module.css';
import toast from 'react-hot-toast';

interface VirtualCardProps {
    card: {
        cardNumber: string;
        expiryDate: string;
        cvv: string;
        status: string;
        type: string;
    };
    userName: string;
    overrideStatus?: string;
    siteName?: string;
}

export default function VirtualCard({ card, userName, overrideStatus, siteName }: VirtualCardProps) {
    const [showDetails, setShowDetails] = useState(false);
    const [copied, setCopied] = useState(false);

    const currentStatus = overrideStatus || card.status;
    const isFrozen = currentStatus === 'FROZEN';

    const bankLabel = siteName ? siteName.toUpperCase() : 'TRUST  BANK';

    const cleanNum = card.cardNumber.replace(/\D/g, '');

    const getMaskedNumber = (num: string) => {
        const last4 = num.slice(-4);
        const first4 = num.slice(0, 4);
        return `${first4} •••• •••• ${last4}`;
    };

    const displayNum = showDetails
        ? cleanNum.match(/.{1,4}/g)?.join(' ') || cleanNum
        : getMaskedNumber(cleanNum);

    const handleCopy = () => {
        navigator.clipboard.writeText(cleanNum);
        setCopied(true);
        toast.success("Card number copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`${styles.visaCard} ${isFrozen ? styles.frozenCard : ''}`}>
            <div className={styles.cardShine}></div>
            <div className={styles.cardTexture}></div>

            <button
                onClick={() => setShowDetails(!showDetails)}
                className={styles.eyeBtn}
                title={showDetails ? "Hide Details" : "Reveal Details"}
            >
                {showDetails ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>

            <div className={styles.cardContent}>
                <div className={styles.cardTop}>
                    <span className={styles.bankName}>{bankLabel}</span>
                    <span className={styles.cardType}>{card.type}</span>
                </div>

                <div className={styles.chipRow}>
                    <div className={styles.chip}></div>
                    <div className={styles.contactlessIcon}>
                        <span>) ) )</span>
                    </div>
                </div>

                <div className={styles.cardNumberWrapper}>
                    <div className={styles.cardNumber}>{displayNum}</div>
                    {showDetails && (
                        <button onClick={handleCopy} className={styles.copyBtn} title="Copy Number">
                            {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                        </button>
                    )}
                </div>

                <div className={styles.cardDetails}>
                    <div className={styles.detailGroup}>
                        <span className={styles.detailLabel}>Card Holder</span>
                        <span className={styles.detailValue}>{userName}</span>
                    </div>
                    <div className={styles.detailGroup}>
                        <span className={styles.detailLabel}>Expires</span>
                        <span className={styles.detailValue}>{card.expiryDate}</span>
                    </div>
                    <div className={styles.detailGroup}>
                        <span className={styles.detailLabel}>CVV</span>
                        <span className={styles.detailValue}>
                            {showDetails ? card.cvv : '•••'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}