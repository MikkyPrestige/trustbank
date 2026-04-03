/* eslint-disable @next/next/no-img-element */
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import TradeForm from "@/components/dashboard/crypto/TradeForm";
import CryptoActionModal from "@/components/dashboard/crypto/CryptoActionModal";
import DepositModal from "@/components/dashboard/crypto/DepositModal";
import CryptoTransactions from "@/components/dashboard/crypto/CryptoTransactions";
import styles from "../../../../components/dashboard/crypto/crypto.module.css";
import { Lock, Wallet, TrendingUp, Ban, AlertTriangle } from "lucide-react";
import { getLiveMarketData } from "@/lib/marketData";
import { KycStatus } from "@prisma/client";
import { getFeatureStatus } from "@/actions/admin/system-status";
import Link from "next/link";

const COIN_IMAGES: Record<string, string> = {
    'USDT': '/assets/usdt.png',
    'BTC': '/assets/btc.png',
    'ETH': '/assets/eth.png',
    'SOL': '/assets/sol.png',
    'BNB': '/assets/bnb.png',
    'HYPE': '/assets/hype.png',
    'XRP': '/assets/xrp.png',
    'ADA': '/assets/ada.png',
    'DOGE': '/assets/doge.png',
    'DOT': '/assets/dot.png',
    'LINK': '/assets/link.png',
    'LTC': '/assets/litecoin.png',
};

export default async function CryptoPage() {
    const session = await auth();
    const features = await getFeatureStatus();

    if (!session) redirect("/login");

    const [user, rates] = await Promise.all([
        db.user.findUnique({
            where: { id: session.user.id },
            include: { cryptoAssets: true }
        }),
        db.exchangeRate.findMany()
    ]);

    if (!user) return null;
    const isVerified = user.kycStatus === KycStatus.VERIFIED;

    const currency = user.currency || "USD";
    const rate = currency === "USD" ? 1 : Number(rates.find(r => r.currency === currency)?.rate || 1);

    const { assets: marketData } = await getLiveMarketData();

    const priceMap = marketData.reduce((acc, item) => {
        acc[item.symbol] = {
            price: item.price * rate,
            change: item.change
        };
        return acc;
    }, {} as Record<string, { price: number, change: number }>);

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
                    <Link href="/dashboard/verify" className={styles.verifyBtn}>Complete Verification</Link>
                </div>
            ) : !features.crypto ? (
                <div className={styles.lockedState}>
                    <div className={styles.lockIconBox}>
                        <Ban size={32} />
                    </div>
                    <h2>Crypto Trading Paused</h2>
                    <p>Cryptocurrency trading is currently disabled by administration. Please check back later.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    <div className={styles.mainColumn}>

                        <div className={styles.portfolioCard}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.headerRow}><Wallet size={20} className={styles.headerRowIcon} /> Your Assets</div>
                                <DepositModal />
                            </div>

                            {cleanAssets.length === 0 ? (
                                <div className={styles.empty}>
                                    <p>Your portfolio is empty.</p>
                                    <span>Use the widget to buy your first coin.</span>
                                </div>
                            ) : (
                                <div className={styles.assetList}>
                                    {cleanAssets.map(asset => {
                                        const liveData = priceMap[asset.symbol];
                                        const currentPrice = liveData?.price || 0;
                                        const qty = asset.quantity;
                                        const avgBuy = asset.avgBuyPrice * rate;
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

                                                <div className={styles.assetDetails}>
                                                    <div className={styles.assetValue}>
                                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(currentValue)}
                                                    </div>
                                                    {qty > 0 && (
                                                        <div className={`${styles.profitText} ${isProfit ? styles.textSuccess : styles.textDanger}`}>
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
                                <div className={styles.headerRow}><TrendingUp size={20} className={styles.headerRowIcon} /> Live Market</div>
                            </div>
                            {Array.isArray(marketData) && marketData.filter(item => item.isCrypto).map((coin) => {
                                const convertedPrice = coin.price * rate;
                                return (
                                    <div key={coin.symbol} className={styles.tickerItem}>
                                        <div className={styles.tickerLeft}>
                                            <img
                                                className={styles.tickerIcon}
                                                src={COIN_IMAGES[coin.symbol]}
                                                alt={coin.symbol} width={32} height={32}
                                            />
                                            <div>
                                                <span className={styles.tickerName}>{coin.symbol}</span>
                                                <span className={styles.tickerSym}>Token</span>
                                            </div>
                                        </div>
                                        <div className={styles.priceRight}>
                                            <div className={coin.change >= 0 ? styles.priceUp : styles.priceDown}>
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(convertedPrice)}
                                            </div>
                                            <div>
                                                <span className={styles.percentPill} style={{ color: coin.change >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                                    {coin.change >= 0 ? '+' : ''}{coin.change.toFixed(2)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div>
                        <div className={styles.stickyForm}>
                            <TradeForm
                                livePrices={priceMap}
                                assets={cleanAssets}
                                currency={currency}
                                rate={rate}
                            />
                            <div className={styles.riskNote}>
                                <AlertTriangle size={20} className={styles.riskNoteIcon} />
                                <p>Crypto markets are volatile. Prices update in real-time. Trade at your own risk.</p>
                            </div>
                            <CryptoTransactions
                                currency={currency}
                                rate={rate}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}