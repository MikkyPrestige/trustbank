/* eslint-disable @next/next/no-img-element */
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import TradeForm from "./TradeForm";
import CryptoActionModal from "./CryptoActionModal";
import styles from "./crypto.module.css";
import { Lock, Wallet, TrendingUp, AlertTriangle } from "lucide-react";
import { getLiveCryptoPrices } from "@/lib/crypto-api";

export default async function CryptoPage() {
    const session = await auth();
    if (!session) redirect("/login");

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { cryptoAssets: true }
    });

    if (!user) return null;

    const isVerified = user.kycVerified;
    const prices = await getLiveCryptoPrices();

    const coinMap: Record<string, string> = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'SOL': 'solana',
        'HYPE': 'hype'
    };

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
                    <a href="/dashboard/settings" className={styles.verifyBtn}>Complete Verification</a>
                </div>
            ) : (
                <div className={styles.grid}>

                    {/* LEFT COLUMN: PORTFOLIO & MARKET */}
                    <div className={styles.mainColumn}>

                        {/* PORTFOLIO */}
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
                                        const geckoId = coinMap[asset.symbol] || 'bitcoin';
                                        const currentPrice = prices[geckoId]?.usd || 0;
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

                        {/* MARKET TRENDS */}
                        <div className={styles.marketList}>
                            <div className={styles.sectionHeader}>
                                <div><TrendingUp size={20} /> Live Market</div>
                            </div>

                            {/* BTC */}
                            <div className={styles.tickerItem}>
                                <div className={styles.tickerLeft}>
                                    <img className={styles.tickerIcon} src="https://assets.coingecko.com/coins/images/1/small/bitcoin.png" alt="BTC" width={32} height={32} />
                                    <div>
                                        <span className={styles.tickerName}>Bitcoin</span>
                                        <span className={styles.tickerSym}>BTC</span>
                                    </div>
                                </div>
                                <div>
                                    <div className={prices.bitcoin.usd_24h_change >= 0 ? styles.priceUp : styles.priceDown}>
                                        ${prices.bitcoin.usd.toLocaleString()}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className={styles.percentPill} style={{ color: prices.bitcoin.usd_24h_change >= 0 ? '#22c55e' : '#ef4444' }}>
                                            {prices.bitcoin.usd_24h_change >= 0 ? '+' : ''}{prices.bitcoin.usd_24h_change.toFixed(2)}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* ETH */}
                            <div className={styles.tickerItem}>
                                <div className={styles.tickerLeft}>
                                    <img className={styles.tickerIcon} src="https://assets.coingecko.com/coins/images/279/small/ethereum.png" alt="ETH" width={32} height={32} />
                                    <div>
                                        <span className={styles.tickerName}>Ethereum</span>
                                        <span className={styles.tickerSym}>ETH</span>
                                    </div>
                                </div>
                                <div>
                                    <div className={prices.ethereum.usd_24h_change >= 0 ? styles.priceUp : styles.priceDown}>
                                        ${prices.ethereum.usd.toLocaleString()}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className={styles.percentPill} style={{ color: prices.ethereum.usd_24h_change >= 0 ? '#22c55e' : '#ef4444' }}>
                                            {prices.ethereum.usd_24h_change >= 0 ? '+' : ''}{prices.ethereum.usd_24h_change.toFixed(2)}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* SOL */}
                            <div className={styles.tickerItem}>
                                <div className={styles.tickerLeft}>
                                    <img className={styles.tickerIcon} src="https://assets.coingecko.com/coins/images/4128/small/solana.png" alt="SOL" width={32} height={32} />
                                    <div>
                                        <span className={styles.tickerName}>Solana</span>
                                        <span className={styles.tickerSym}>SOL</span>
                                    </div>
                                </div>
                                <div>
                                    <div className={prices.solana.usd_24h_change >= 0 ? styles.priceUp : styles.priceDown}>
                                        ${prices.solana.usd.toLocaleString()}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className={styles.percentPill} style={{ color: prices.solana.usd_24h_change >= 0 ? '#22c55e' : '#ef4444' }}>
                                            {prices.solana.usd_24h_change >= 0 ? '+' : ''}{prices.solana.usd_24h_change.toFixed(2)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: TRADE FORM */}
                    <div>
                        <div className={styles.stickyForm}>
                            <TradeForm livePrices={prices} />

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