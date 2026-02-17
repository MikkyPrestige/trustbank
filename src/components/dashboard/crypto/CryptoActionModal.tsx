'use client';

import { useState, useActionState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { transferCrypto } from '@/actions/user/crypto';
import styles from './crypto.module.css';
import { ArrowUpRight, ArrowDownLeft, Copy, X, Loader2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface Asset {
    id: string;
    symbol: string;
    quantity: number;
    userId: string;
}

export default function CryptoActionModal({ asset }: { asset: Asset }) {
    const [mode, setMode] = useState<'SEND' | 'RECEIVE' | null>(null);
    const [copied, setCopied] = useState(false);
    const [sendAmount, setSendAmount] = useState('');

    const [state, action, isPending] = useActionState(transferCrypto, undefined);

    const walletAddress = asset.userId;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${walletAddress}`;

    useEffect(() => {
        if (state?.message) {
            if (state.success) {
                toast.success(state.message);
                const timer = setTimeout(() => {
                    setMode(null);
                    setSendAmount('');
                }, 1000);
                return () => clearTimeout(timer);
            } else {
                toast.error(state.message);
            }
        }
    }, [state]);

    const handleCopy = () => {
        navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        toast.success("Address Copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleMaxSend = () => {
        setSendAmount(asset.quantity.toString());
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

    return createPortal(
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h3 style={{ margin: 0 }}>
                        {mode === 'SEND' ? `Send ${asset.symbol}` : `Receive ${asset.symbol}`}
                    </h3>
                    <button onClick={() => setMode(null)} className={styles.closeBtn}>
                        <X size={20} />
                    </button>
                </div>

                {mode === 'RECEIVE' && (
                    <div className={styles.receiveBox}>
                        <div className={styles.qrPlaceholder}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={qrUrl}
                                alt="Wallet QR Code"
                                className={styles.qrImage}
                            />
                        </div>
                        <p className={styles.qrText}>
                            Scan to deposit <strong>{asset.symbol}</strong> directly to your wallet.
                            <br />Network: <strong>TrustBank Chain (TBC)</strong>
                        </p>
                        <div className={styles.addressBox}>
                            <span className={styles.addressText}>{walletAddress}</span>
                            <button onClick={handleCopy} className={styles.copyBtn}>
                                {copied ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>
                )}

                {mode === 'SEND' && (
                    <form action={action} className={styles.form}>
                        <input type="hidden" name="symbol" value={asset.symbol} />
                        <div className={styles.group}>
                            <label>Recipient Address</label>
                            <input name="recipient" required placeholder={`Enter ${asset.symbol} Address`} className={styles.input} />
                        </div>
                        <div className={styles.group}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <label>Amount ({asset.symbol})</label>
                                <span
                                    onClick={handleMaxSend}
                                    style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    Max
                                </span>
                            </div>
                            <input
                                name="amount"
                                type="number"
                                step="0.000001"
                                placeholder="0.00"
                                className={styles.input}
                                required
                                value={sendAmount}
                                onChange={(e) => setSendAmount(e.target.value)}
                            />
                            <div className={styles.balanceHint}>
                                Available: <strong>{Number(asset.quantity).toFixed(6)} {asset.symbol}</strong>
                            </div>
                        </div>
                        <div className={styles.group}>
                            <label>Security PIN</label>
                            <input name="pin" type="password" required maxLength={4} placeholder="••••" className={styles.pinInput} />
                        </div>
                        <button disabled={isPending} className={styles.submitBtn}>
                            {isPending ? <Loader2 className={styles.spin} /> : 'Confirm Transfer'}
                        </button>
                    </form>
                )}
            </div>
        </div>,
        document.body
    );
}