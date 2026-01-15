/* eslint-disable @next/next/no-img-element */
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import TradeForm from "./TradeForm";
import CryptoActionModal from "./CryptoActionModal";
import styles from "./crypto.module.css";
import { Lock, Wallet, TrendingUp, AlertTriangle } from "lucide-react";
import { getLiveMarketData } from "@/lib/marketData";

// Helper for images (since API doesn't always return them in the simple endpoint)
const COIN_IMAGES: Record<string, string> = {
    'BTC': 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
    'ETH': 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    'SOL': 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
    'XRP': 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png',
    'ADA': 'https://assets.coingecko.com/coins/images/975/small/cardano.png',
    'DOGE': 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png',
    'DOT': 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png',
    'LINK': 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
};

export default async function CryptoPage() {
    const session = await auth();
    if (!session) redirect("/login");

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { cryptoAssets: true }
    });

    if (!user) return null;

    const isVerified = user.kycStatus === 'VERIFIED';

    // 1. Fetch the New Array Data
    const marketData = await getLiveMarketData();

    // 2. Create a "Lookup Map" for Portfolio Calculations
    // This converts the Array back to an Object: { "BTC": { price: 90000, change: 2.4 }, ... }
    // This makes finding the price for user assets O(1) instant.
    const priceMap = marketData.reduce((acc, item) => {
        acc[item.symbol] = {
            price: item.price,
            change: item.change
        };
        return acc;
    }, {} as Record<string, { price: number, change: number }>);


    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Crypto Exchange</h1>
                <p className={styles.subtitle}>Trade, send, and receive digital assets instantly.</p>
            </header>

            {!isVerified ? (
                <div className={styles.lockedState}>
                    <div className={styles.lockIconBox}>
                        <Lock size={32} />
                    </div>
                    <h2>Trading Disabled</h2>
                    <p>To access the crypto markets, please complete your Identity Verification (KYC) in Settings.</p>
                    <a href="/dashboard/verify" className={styles.verifyBtn}>Complete Verification</a>
                </div>
            ) : (
                <div className={styles.grid}>

                    {/* LEFT COLUMN: PORTFOLIO & MARKET */}
                    <div className={styles.mainColumn}>

                        {/* PORTFOLIO SECTION */}
                        <div className={styles.portfolioCard}>
                            <div className={styles.sectionHeader}>
                                <div><Wallet size={20} /> Your Assets</div>
                            </div>

                            {user.cryptoAssets.length === 0 ? (
                                <div className={styles.empty}>
                                    <p>Your portfolio is empty.</p>
                                    <span style={{ fontSize: '0.8rem' }}>Use the widget to buy your first coin.</span>
                                </div>
                            ) : (
                                <div className={styles.assetList}>
                                    {user.cryptoAssets.map(asset => {
                                        // Use the priceMap we created above
                                        const liveData = priceMap[asset.symbol];
                                        const currentPrice = liveData?.price || 0;

                                        const qty = Number(asset.quantity);
                                        const avgBuy = Number(asset.avgBuyPrice);

                                        const currentValue = qty * currentPrice;
                                        const costBasis = qty * avgBuy;
                                        const profit = currentValue - costBasis;
                                        const isProfit = profit >= 0;
                                        const profitPercent = costBasis > 0 ? (profit / costBasis) * 100 : 0;

                                        return (
                                            <div key={asset.id} className={styles.assetItem}>
                                                <div className={styles.assetInfo}>
                                                    <span className={styles.coinName}>{asset.symbol}</span>
                                                    <span className={styles.coinBalance}>{qty.toFixed(6)}</span>
                                                </div>

                                                <CryptoActionModal asset={asset} />

                                                <div style={{ textAlign: 'right', minWidth: '100px' }}>
                                                    <div className={styles.assetValue}>
                                                        ${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </div>
                                                    {qty > 0 && (
                                                        <div style={{
                                                            fontSize: '0.75rem',
                                                            color: isProfit ? '#22c55e' : '#ef4444',
                                                            fontWeight: 'bold',
                                                            marginTop: '2px'
                                                        }}>
                                                            {isProfit ? '+' : ''}{profit.toFixed(2)} ({profitPercent.toFixed(1)}%)
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* MARKET TRENDS (Dynamic List) */}
                        <div className={styles.marketList}>
                            <div className={styles.sectionHeader}>
                                <div><TrendingUp size={20} /> Live Market</div>
                            </div>

                            {/* Now we map over the REAL marketData array instead of hardcoding divs */}
                            {marketData.filter(item => item.isCrypto).map((coin) => (
                                <div key={coin.symbol} className={styles.tickerItem}>
                                    <div className={styles.tickerLeft}>
                                        <img
                                            className={styles.tickerIcon}
                                            src={COIN_IMAGES[coin.symbol] || "https://assets.coingecko.com/coins/images/1/small/bitcoin.png"}
                                            alt={coin.symbol}
                                            width={32}
                                            height={32}
                                        />
                                        <div>
                                            {/* Note: In production you might want a name map, using symbol for now */}
                                            <span className={styles.tickerName}>{coin.symbol}</span>
                                            <span className={styles.tickerSym}>{coin.symbol}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className={coin.change >= 0 ? styles.priceUp : styles.priceDown}>
                                            ${coin.price.toLocaleString(undefined, { minimumFractionDigits: coin.price < 1 ? 4 : 2 })}
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span className={styles.percentPill} style={{ color: coin.change >= 0 ? '#22c55e' : '#ef4444' }}>
                                                {coin.change >= 0 ? '+' : ''}{coin.change.toFixed(2)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>

                    {/* RIGHT COLUMN: TRADE FORM */}
                    <div>
                        <div className={styles.stickyForm}>
                            {/* Pass the array or map depending on how you updated TradeForm.
                                Assuming TradeForm is updated to handle the map or array.
                                Passing the map is safest for logic consistency. */}
                            <TradeForm livePrices={priceMap} />

                            <div className={styles.riskNote}>
                                <AlertTriangle size={16} />
                                <p>Crypto markets are volatile. Prices update in real-time. Trade at your own risk.</p>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}