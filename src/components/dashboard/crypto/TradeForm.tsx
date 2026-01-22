'use client';

import { useActionState, useState, useEffect } from 'react';
import { tradeCrypto } from '@/actions/user/crypto';
import styles from './crypto.module.css';
import { RefreshCw, ArrowRightLeft, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

interface Asset {
    symbol: string;
    quantity: number;
}

interface TradeFormProps {
    livePrices: Record<string, { price: number; change: number }>;
    assets: Asset[];
}

export default function TradeForm({ livePrices, assets }: TradeFormProps) {
    const [state, action, isPending] = useActionState(tradeCrypto, undefined);
    const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
    const [currency, setCurrency] = useState('BTC');
    const [amount, setAmount] = useState('');

    const currentPrice = livePrices[currency]?.price || 0;

    // Find how much of this coin the user owns
    const userAsset = assets.find(a => a.symbol === currency);
    const userBalance = userAsset ? Number(userAsset.quantity) : 0;

    // Calculate Max Sell Value in USD
    const maxSellValue = userBalance * currentPrice;

    // Estimate Logic
    const estimate = amount && currentPrice > 0
        ? (Number(amount) / currentPrice).toFixed(6) + ` ${currency}`
        : '---';

    useEffect(() => {
        if (state?.message) {
            if (state.success) {
                toast.success(state.message);
                const timer = setTimeout(() => setAmount(''), 0);
                return () => clearTimeout(timer);
            } else {
                toast.error(state.message);
            }
        }
    }, [state]);

    const handleMaxClick = () => {
        if (type === 'SELL') {
            const safeMax = (Math.floor(maxSellValue * 100) / 100).toFixed(2);
            setAmount(safeMax);
        }
    };

    const availableSymbols = Object.keys(livePrices).filter(s => s !== 'HYPE');

    return (
        <div className={styles.tradeCard}>
            <div className={styles.tradeHeader}>
                <h3><Activity size={18} style={{ marginRight: '8px', color: '#3b82f6' }} /> Quick Trade</h3>
                <span className={styles.liveBadge}><div className={styles.pulse}></div> Live</span>
            </div>

            <div className={styles.toggleGroup}>
                <button type="button" onClick={() => setType('BUY')} className={`${styles.toggleBtn} ${type === 'BUY' ? styles.buyActive : ''}`}>Buy</button>
                <button type="button" onClick={() => setType('SELL')} className={`${styles.toggleBtn} ${type === 'SELL' ? styles.sellActive : ''}`}>Sell</button>
            </div>

            <form action={action} className={styles.form}>
                <input type="hidden" name="type" value={type} />

                <div className={styles.group}>
                    <label>Select Asset</label>
                    <select name="currency" value={currency} onChange={e => setCurrency(e.target.value)} className={styles.select}>
                        {availableSymbols.map(sym => (
                            <option key={sym} value={sym}>{sym} - ${livePrices[sym].price.toLocaleString()}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.group}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label>{type === 'BUY' ? 'Pay Amount (USD)' : 'Sell Value (USD)'}</label>
                        {type === 'SELL' && userBalance > 0 && (
                            <span
                                onClick={handleMaxClick}
                                style={{ fontSize: '0.75rem', color: '#3b82f6', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Max: ${maxSellValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </span>
                        )}
                    </div>

                    <input
                        name="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className={styles.input}
                        style={{ fontSize: '1.4rem', fontWeight: 'bold' }}
                    />
                </div>

                <div className={styles.estimateBox}>
                    <span>Rate: 1 {currency} = ${currentPrice.toLocaleString()}</span>
                    <div className={styles.conversion}>{amount ? `≈ ${estimate}` : '0.00'}</div>
                </div>

                <button disabled={isPending} className={styles.submitBtn}>
                    {isPending ? <RefreshCw className={styles.spin} size={20} /> : <ArrowRightLeft size={20} />}
                    {type === 'BUY' ? 'Execute Buy Order' : 'Execute Sell Order'}
                </button>
            </form>
        </div>
    );
}