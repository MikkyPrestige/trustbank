/* eslint-disable @next/next/no-img-element */

'use client';

import { useState, useActionState, useEffect } from 'react';
import { transferCrypto } from '@/actions/user/crypto';
import styles from './crypto.module.css';
import { ArrowUpRight, ArrowDownLeft, Copy, X, Loader2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

// Define the shape of the asset to avoid 'any'
interface Asset {
    id: string;
    symbol: string;
    quantity: number | string;
    userId: string;
}

export default function CryptoActionModal({ asset }: { asset: Asset }) {
    const [mode, setMode] = useState<'SEND' | 'RECEIVE' | null>(null);
    const [copied, setCopied] = useState(false);
    const [state, action, isPending] = useActionState(transferCrypto, undefined);

    // Mock Wallet Address (In production, this would be a real crypto address)
    const walletAddress = `0x${asset.userId.slice(0, 8)}...${asset.symbol}Wallet`.toUpperCase();

    // Generate a Real QR Code for the address
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${walletAddress}`;

    useEffect(() => {
        if (state?.message) {
            if (state.success) {
                toast.success(state.message);
                const timer = setTimeout(() => {
                    setMode(null);
                }, 500); // Small delay so user sees success
                return () => clearTimeout(timer);
            } else {
                toast.error(state.message);
            }
        }
    }, [state]);

    // Handle Copy Feedback
    const handleCopy = () => {
        navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        toast.success("Address Copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    if (!mode) {
        return (
            <div className={styles.actionButtons}>
                <button onClick={() => setMode('SEND')} className={styles.sendBtn}>
                    <ArrowUpRight size={14} /> Send
                </button>
                <button onClick={() => setMode('RECEIVE')} className={styles.receiveBtn}>
                    <ArrowDownLeft size={14} /> Receive
                </button>
            </div>
        );
    }

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h3>{mode === 'SEND' ? `Send ${asset.symbol}` : `Receive ${asset.symbol}`}</h3>
                    <button onClick={() => setMode(null)} className={styles.closeBtn}>
                        <X size={20} />
                    </button>
                </div>

                {mode === 'RECEIVE' && (
                    <div className={styles.receiveBox}>
                        <div className={styles.qrPlaceholder}>
                            {/* ✅ NEW: Real QR Code Image */}
                            <img
                                src={qrUrl}
                                alt="Wallet QR Code"
                                className={styles.qrImage}
                                style={{ borderRadius: '8px', border: '4px solid white' }}
                            />
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', marginTop: '1rem', textAlign: 'center' }}>
                            Scan to deposit <strong>{asset.symbol}</strong> directly to your wallet.
                        </p>

                        <div className={styles.addressBox}>
                            <span className={styles.addressText}>{walletAddress}</span>
                            <button onClick={handleCopy} className={styles.copyBtn}>
                                {copied ? <Check size={16} color="#22c55e" /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>
                )}

                {mode === 'SEND' && (
                    <form action={action} className={styles.form}>
                        <input type="hidden" name="symbol" value={asset.symbol} />

                        <div className={styles.group}>
                            <label>Recipient Address</label>
                            <input
                                name="recipient"
                                required
                                placeholder={`Enter ${asset.symbol} Address`}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.group}>
                            <label>Amount ({asset.symbol})</label>
                            <input
                                name="amount"
                                type="number"
                                step="0.000001"
                                placeholder="0.00"
                                className={styles.input}
                            />
                            <div className={styles.balanceHint}>
                                Available: <strong>{Number(asset.quantity).toFixed(6)} {asset.symbol}</strong>
                            </div>
                        </div>

                        <div className={styles.group}>
                            <label>Security PIN</label>
                            <input
                                name="pin"
                                type="password"
                                required
                                maxLength={4}
                                placeholder="••••"
                                className={styles.pinInput}
                            />
                        </div>

                        <button disabled={isPending} className={styles.submitBtn}>
                            {isPending ? <Loader2 className={styles.spin} /> : 'Confirm Transfer'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}