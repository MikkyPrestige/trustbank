/* eslint-disable @next/next/no-img-element */
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import TradeForm from "@/components/dashboard/crypto/TradeForm";
import CryptoActionModal from "@/components/dashboard/crypto/CryptoActionModal";
import DepositModal from "@/components/dashboard/crypto/DepositModal";
import CryptoTransactions from "@/components/dashboard/crypto/CryptoTransactions";
import styles from "../../../../components/dashboard/crypto/crypto.module.css";
import { Lock, Wallet, TrendingUp, AlertTriangle } from "lucide-react";
import { getLiveMarketData } from "@/lib/marketData";
import { KycStatus } from "@prisma/client"; // ✅ Import Enum

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
    const isVerified = user.kycStatus === KycStatus.VERIFIED; // ✅ Strict Enum

    const marketData = await getLiveMarketData();

    const priceMap = marketData.reduce((acc, item) => {
        acc[item.symbol] = { price: item.price, change: item.change };
        return acc;
    }, {} as Record<string, { price: number, change: number }>);

    // ✅ Clean Assets: Convert Prisma Decimals to Numbers
    const cleanAssets = user.cryptoAssets.map(asset => ({
        id: asset.id,
        userId: asset.userId,
        symbol: asset.symbol,
        quantity: Number(asset.quantity),
        avgBuyPrice: Number(asset.avgBuyPrice),
    }));

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Crypto Exchange</h1>
                <p className={styles.subtitle}>Trade, send, and receive digital assets instantly.</p>
            </header>

            {!isVerified ? (
                <div className={styles.lockedState}>
                    <div className={styles.lockIconBox}><Lock size={32} /></div>
                    <h2>Trading Disabled</h2>
                    <p>To access the crypto markets, please complete your Identity Verification (KYC).</p>
                    <a href="/dashboard/verify" className={styles.verifyBtn}>Complete Verification</a>
                </div>
            ) : (
                <div className={styles.grid}>
                    <div className={styles.mainColumn}>

                        <div className={styles.portfolioCard}>
                            <div className={styles.sectionHeader}>
                                <div><Wallet size={20} color="#3b82f6" /> Your Assets</div>
                                <DepositModal />
                            </div>

                            {cleanAssets.length === 0 ? (
                                <div className={styles.empty}>
                                    <p>Your portfolio is empty.</p>
                                    <span style={{ fontSize: '0.8rem' }}>Use the widget to buy your first coin.</span>
                                </div>
                            ) : (
                                <div className={styles.assetList}>
                                    {cleanAssets.map(asset => {
                                        const liveData = priceMap[asset.symbol];
                                        const currentPrice = liveData?.price || 0;
                                        const qty = asset.quantity;
                                        const avgBuy = asset.avgBuyPrice;
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
                                                        <div style={{ fontSize: '0.75rem', color: isProfit ? '#22c55e' : '#ef4444', fontWeight: 'bold', marginTop: '2px' }}>
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

                        <div className={styles.marketList}>
                            <div className={styles.sectionHeader}>
                                <div><TrendingUp size={20} color="#22c55e" /> Live Market</div>
                            </div>
                            {marketData.filter(item => item.isCrypto).map((coin) => (
                                <div key={coin.symbol} className={styles.tickerItem}>
                                    <div className={styles.tickerLeft}>
                                        <img
                                            className={styles.tickerIcon}
                                            src={COIN_IMAGES[coin.symbol] || "https://assets.coingecko.com/coins/images/1/small/bitcoin.png"}
                                            alt={coin.symbol} width={32} height={32}
                                        />
                                        <div>
                                            <span className={styles.tickerName}>{coin.symbol}</span>
                                            <span className={styles.tickerSym}>Token</span>
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

                    <div>
                        <div className={styles.stickyForm}>
                            <TradeForm livePrices={priceMap} assets={cleanAssets} />
                            <div className={styles.riskNote}>
                                <AlertTriangle size={16} style={{ minWidth: '16px' }} />
                                <p>Crypto markets are volatile. Prices update in real-time. Trade at your own risk.</p>
                            </div>
                            <CryptoTransactions />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}