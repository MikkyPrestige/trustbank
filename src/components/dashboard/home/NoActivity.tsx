import { useRouter } from 'next/navigation';
import { Plus, ArrowUpRight, X, Wallet, Check, Copy } from "lucide-react";
import styles from "./styles/NoActivity.module.css";
import style from './styles/balanceCard.module.css';
import { useState } from "react";

interface NoActivityProps {
    accountName: string;
    accountNumber: string;
    routingNumber?: string | null;
    bankName: string;
}

export default function NoActivity({ accountName, accountNumber, routingNumber, bankName, }: NoActivityProps) {
    const router = useRouter();
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [copied, setCopied] = useState(false);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleTransfer = () => {
        router.push('/dashboard/transfer');
    };

    return (
        <div className={styles.container}>
            <div className={styles.illustration}>
                <div className={styles.pulseRing} />
                <div className={styles.iconCircle}>
                    <Plus size={25} strokeWidth={1.5} />
                </div>
            </div>

            <div className={styles.textStack}>
                <h3 className={styles.title}>No transactions yet</h3>
                <p className={styles.description}>
                    Your financial activity will appear here once you start
                    spending, receiving, or transferring funds.
                </p>
            </div>

            <div className={styles.actions}>
                <button onClick={() => setShowDepositModal(true)} className={styles.mainBtn}>
                    Add Funds <Plus size={16} />
                </button>
                <button onClick={handleTransfer} className={styles.secondaryBtn}>
                    Transfer <ArrowUpRight size={16} />
                </button>
            </div>

            {showDepositModal && (
                <div className={style.modalOverlay}>
                    <div className={style.modalContent}>
                        <div className={style.modalHeader}>
                            <h3 className={style.modalTitle}>Account Details</h3>
                            <button className={style.closeBtn} onClick={() => setShowDepositModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={style.modalDescription}>
                            <div className={style.iconContainer}>
                                <Wallet size={30} />
                            </div>
                            <p>Use these details to receive wire transfers or direct deposits.</p>
                        </div>

                        <div className={style.detailsList}>
                            <div className={style.detailRow}>
                                <span className={style.detailLabel}>Bank Name</span>
                                <span className={style.detailValue}>{bankName}</span>
                            </div>
                            <div className={style.detailRow}>
                                <span className={style.detailLabel}>Account Name</span>
                                <span className={style.detailValue}>{accountName}</span>
                            </div>

                            <div className={style.copyContainer}>
                                <div>
                                    <div className={style.accountLabel}>Account Number</div>
                                    <div className={style.accountValue}>{accountNumber}</div>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(accountNumber)}
                                    className={`${style.copyBtn} ${copied ? style.copySuccess : ''}`}
                                >
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                </button>
                            </div>
                            {routingNumber && (
                                <div className={style.detailRow}>
                                    <span className={style.detailLabel}>Routing Number</span>
                                    <span className={style.detailValue}>{routingNumber}</span>
                                </div>
                            )}
                        </div>

                        <button className={style.doneBtn} onClick={() => setShowDepositModal(false)}>
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}