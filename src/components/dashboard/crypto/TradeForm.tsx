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
    currency: string;
    rate: number;
}

export default function TradeForm({ livePrices, assets, currency, rate }: TradeFormProps) {
    const [state, action, isPending] = useActionState(tradeCrypto, undefined);
    const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
    const [selectedCoin, setSelectedCoin] = useState('BTC');
    const [amount, setAmount] = useState('');

    const currentPrice = livePrices[selectedCoin]?.price || 0;

    const userAsset = assets.find(a => a.symbol === selectedCoin);
    const userBalance = userAsset ? Number(userAsset.quantity) : 0;

    const maxSellValue = userBalance * currentPrice;

    const estimate = amount && currentPrice > 0
        ? (Number(amount) / currentPrice).toFixed(6) + ` ${selectedCoin}`
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

    const handleSubmit = (formData: FormData) => {
        const inputAmount = Number(formData.get("amount"));

        const usdAmount = inputAmount / rate;
        formData.set("amount", usdAmount.toString());

        formData.set("displayAmount", inputAmount.toString());
        formData.set("displayCurrency", currency);

        action(formData);
    }

    const availableSymbols = Object.keys(livePrices);

    return (
        <div className={styles.tradeCard}>
            <div className={styles.tradeHeader}>
                <h3 className={styles.headerRow}>
                    <Activity size={18} className={styles.tradeHeaderIcon}  /> Quick Trade
                </h3>
                <span className={styles.liveBadge}><div className={styles.pulse}></div> Live</span>
            </div>

            <div className={styles.toggleGroup}>
                <button type="button" onClick={() => setType('BUY')} className={`${styles.toggleBtn} ${type === 'BUY' ? styles.buyActive : ''}`}>Buy</button>
                <button type="button" onClick={() => setType('SELL')} className={`${styles.toggleBtn} ${type === 'SELL' ? styles.sellActive : ''}`}>Sell</button>
            </div>

            <form action={handleSubmit} className={styles.form}>
                <input type="hidden" name="type" value={type} />

                <div className={styles.group}>
                    <label>Select Asset</label>
                    <select name="currency" value={selectedCoin} onChange={e => setSelectedCoin(e.target.value)} className={styles.select}>
                        {availableSymbols.map(sym => (
                            <option key={sym} value={sym}>
                                {sym} - {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(livePrices[sym].price)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.group}>
                    <div className={styles.maxBtnContainer}>
                        <label>{type === 'BUY' ? `Pay Amount (${currency})` : `Sell Value (${currency})`}</label>
                        {type === 'SELL' && userBalance > 0 && (
                            <span onClick={handleMaxClick} className={styles.maxBtn}>
                                Max: {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(maxSellValue)}
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
                        className={`${styles.input} ${styles.inputLarge}`}
                    />
                </div>

                <div className={styles.estimateBox}>
                    <span>Rate: 1 {selectedCoin} = {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(currentPrice)}</span>
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
