import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Bitcoin, PieChart, Lock, RefreshCcw } from "lucide-react";
import styles from "../../app/home.module.css";
import { getLiveMarketData } from "@/lib/marketData";

// Helper to format currency
const formatPrice = (num: number, isCrypto: boolean) => {
    // Show more decimals for cheap crypto (like Doge $0.12)
    const decimals = isCrypto && num < 10 ? 4 : 2;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: decimals
    }).format(num);
};

const formatPercent = (num: number) => {
    const isPositive = num >= 0;
    return (
        <span className={isPositive ? styles.tickerUp : styles.tickerDown}>
            {isPositive ? '+' : ''}{num.toFixed(2)}%
        </span>
    );
};

export default async function InvestmentSection() {
    // 1. Fetch Real Data on the Server
    const marketData = await getLiveMarketData();
    const tickerItems = [...marketData, ...marketData];

    return (
        <section className={styles.investSection}>

            {/* 1. REAL-TIME TICKER STRIP */}
            <div className={styles.tickerStrip}>
                <div className={styles.tickerTrack}>
                    {tickerItems.map((item, index) => (
                        <div key={`${item.symbol}-${index}`} className={styles.tickerItemWrapper}>
                            <div className={styles.tickerItem}>
                                <span className={styles.tickerSymbol}>{item.symbol}</span>
                                <span className={styles.tickerValue}>
                                    {formatPrice(item.price, item.isCrypto)}
                                </span>
                                {formatPercent(item.change)}
                            </div>
                            {/* Divider between every item */}
                            <div className={styles.tickerDivider}></div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.container}>
                <div className={styles.investGrid}>

                    {/* LEFT: CONTENT & TABS */}
                    <div className={styles.investContent}>
                        <div className={styles.investHeader}>
                            <h2 className={styles.sectionTitleDark}>
                                Invest in your future.<br />
                                <span className={styles.highlightBlue}>On your terms.</span>
                            </h2>
                            <p className={styles.sectionDescDark}>
                                Build a diversified portfolio with Stocks, ETFs, and Crypto all in one secure place.
                                No wallet addresses to manage, just seamless wealth building.
                            </p>
                        </div>

                        {/* Feature List */}
                        <div className={styles.investFeatures}>
                            {/* ... Features remain the same ... */}
                            <div className={styles.investFeatureItem}>
                                <div className={styles.iconBoxGlass}>
                                    <PieChart size={24} className={styles.iconBlue} />
                                </div>
                                <div>
                                    <h4>Smart Portfolios</h4>
                                    <p>Automated investing based on your risk tolerance.</p>
                                </div>
                            </div>
                            <div className={styles.investFeatureItem}>
                                <div className={styles.iconBoxGlass}>
                                    <Bitcoin size={24} className={styles.iconGold} />
                                </div>
                                <div>
                                    <h4>Integrated Crypto</h4>
                                    <p>Buy, sell, and hold top cryptocurrencies instantly.</p>
                                </div>
                            </div>
                            <div className={styles.investFeatureItem}>
                                <div className={styles.iconBoxGlass}>
                                    <Lock size={24} className={styles.iconGreen} />
                                </div>
                                <div>
                                    <h4>Bank-Grade Security</h4>
                                    <p>SIPC insurance for securities. Cold storage for crypto.</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.investActions}>
                            <Link href="/invest" className={styles.btnPrimary}>
                                Start Investing
                            </Link>
                            <Link href="/crypto" className={styles.linkDark}>
                                View Crypto Assets <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>

                    {/* RIGHT: VISUAL */}
                    <div className={styles.investVisual}>
                        <div className={styles.blueBlob}></div>

                        <div className={styles.phoneWrapper}>
                            <Image
                                src="/app-invest.png"
                                alt="TrustBank Investment App"
                                width={340}
                                height={680}
                                className={styles.phoneImage}
                            />

                            {/* Floating Card: Updated with Real BTC Data */}
                            <div className={styles.floatCardTop}>
                                <div className={styles.floatIconGold}><Bitcoin size={20} /></div>
                                <div>
                                    <span className={styles.floatLabel}>Bitcoin</span>
                                    <span className={styles.floatValue}>
                                        {marketData.length > 0 ? formatPrice(marketData[1].price, true) : "$98k"}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.floatCardBottom}>
                                <div className={styles.floatIconBlue}><RefreshCcw size={20} /></div>
                                <div>
                                    <span className={styles.floatLabel}>Auto-Invest</span>
                                    <span className={styles.floatValue}>$500/mo</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}