'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
    Send,
    Copy,
    Check,
    X,
    Wallet,
    AlertCircle,
    Lock
} from 'lucide-react';
import styles from './styles/balanceCard.module.css';

interface BalanceCardProps {
    totalBalance: number;
    accountName: string;
    accountNumber: string;
    routingNumber?: string | null;
    bankName: string;
    trend: number;
    status: string;
}

export default function BalanceCard({
    totalBalance,
    accountName,
    accountNumber,
    routingNumber,
    bankName,
    trend,
    status
}: BalanceCardProps) {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(true);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [copied, setCopied] = useState(false);

    const toggleVisibility = () => setIsVisible(!isVisible);

    // --- STATUS LOGIC ---
    const isFrozen = status === 'FROZEN' || status === 'SUSPENDED';

    const getStatusConfig = () => {
        if (status === 'FROZEN') return { label: 'FROZEN', style: styles.statusFrozen, icon: <Lock size={10} /> };
        if (status === 'SUSPENDED') return { label: 'LOCKED', style: styles.statusFrozen, icon: <AlertCircle size={10} /> };
        return { label: 'LIVE', style: styles.statusLive, icon: null };
    };

    const statusConfig = getStatusConfig();

    // Determine visual state
    const isPositive = trend > 0;
    const isNeutral = trend === 0;

    const handleTransfer = () => {
        router.push('/dashboard/transfer');
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const displayMoney = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <>
            <div className={styles.balanceCard}>
                <div className={styles.cardTexture}></div>
                {/* Hide if frozen to emphasize stoppage */}
                {!isFrozen && (
                    <svg className={styles.sparkline} viewBox="0 0 100 30" preserveAspectRatio="none">
                        <path d="M0,30 Q10,25 20,28 T40,15 T60,20 T80,5 T100,15 L100,30 L0,30 Z" className={styles.sparklinePathFill} />
                        <path d="M0,30 Q10,25 20,28 T40,15 T60,20 T80,5 T100,15" className={styles.sparklinePathStroke} />
                        <defs>
                            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                    </svg>
                )}

                <div className={styles.cardTop}>
                    <div className={styles.cardLabel}>TOTAL LIQUIDITY</div>
                    <div className={`${styles.liveIndicator} ${statusConfig.style}`}>
                        {statusConfig.icon ? statusConfig.icon : <div className={styles.dot}></div>}
                        {statusConfig.label}
                    </div>
                </div>

                <div className={styles.balanceRow} onClick={toggleVisibility}>
                    <div className={isVisible ? styles.balanceAmount : styles.hiddenBalance}>
                        {displayMoney(totalBalance)}
                    </div>
                </div>

                <div className={styles.trendRow}>
                    <div className={`${styles.trendPill} ${isPositive ? styles.trendUp : isNeutral ? styles.trendNeutral : styles.trendDown}`}>
                        {isNeutral ? <Minus size={16} /> : isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        {Math.abs(trend).toFixed(1)}%
                    </div>
                    <span className={styles.trendSubtext}>vs last 30 days</span>
                </div>

                <div className={styles.cardFooter}>
                    <button
                        className={styles.actionBtn}
                        onClick={() => setShowDepositModal(true)}
                    >
                        <Plus size={16} /> Add Money
                    </button>

                    <button
                        className={`${styles.actionBtn} ${styles.primaryBtn}`}
                        onClick={handleTransfer}
                    >
                        <Send size={16} /> Transfer
                    </button>
                </div>
            </div>

            {/* --- DEPOSIT MODAL --- */}
            {showDepositModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Account Details</h3>
                            <button className={styles.closeBtn} onClick={() => setShowDepositModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.modalDescription}>
                            <div className={styles.iconContainer}>
                                <Wallet size={30} />
                            </div>
                            <p>Use these details to receive wire transfers or direct deposits.</p>
                        </div>

                        <div className={styles.detailsList}>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Bank Name</span>
                                <span className={styles.detailValue}>{bankName}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Account Name</span>
                                <span className={styles.detailValue}>{accountName}</span>
                            </div>

                            {/* Copyable Account Number */}
                            <div className={styles.copyContainer}>
                                <div>
                                    <div className={styles.accountLabel}>Account Number</div>
                                    <div className={styles.accountValue}>{accountNumber}</div>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(accountNumber)}
                                    className={`${styles.copyBtn} ${copied ? styles.copySuccess : ''}`}
                                >
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                </button>
                            </div>

                            {routingNumber && (
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Routing Number</span>
                                    <span className={styles.detailValue}>{routingNumber}</span>
                                </div>
                            )}
                        </div>

                        <button className={styles.doneBtn} onClick={() => setShowDepositModal(false)}>
                            Done
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}