import { getSiteSettings } from "@/lib/get-settings";
import { getLiveMarketData } from "@/lib/marketData";
import Image from "next/image";
import Link from "next/link";
import { Bitcoin, ShieldCheck, Zap, Globe, Lock } from "lucide-react";
import styles from "./crypto.module.css";

export default async function CryptoPage() {
    // 1. Parallel Fetching for speed
    const [settings, marketData] = await Promise.all([
        getSiteSettings(),
        getLiveMarketData()
    ]);

    // 2. Filter for Crypto only (Helper returns stocks too)
    const cryptoAssets = marketData.filter(item => item.isCrypto);

    // Helper to format currency
    const formatPrice = (num: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: num < 10 ? 4 : 2
        }).format(num);
    };

    return (
        <main className={styles.main}>

            {/* 1. HERO */}
            <section className={styles.hero}>
                <div className={styles.container}>
                    <div className={styles.heroContent}>
                        <div className={styles.badge}><Bitcoin size={16} /> Crypto 2.0</div>
                        <h1>
                            {settings.crypto_hero_title} <br />
                            <span className={styles.highlight}>{settings.crypto_hero_highlight}</span>
                        </h1>
                        <p>{settings.crypto_hero_desc}</p>
                        <div className={styles.heroActions}>
                            <Link href="/register" className={styles.btnPrimary}>Start Trading</Link>
                            <Link href="/learn" className={styles.btnSecondary}>Learn Crypto</Link>
                        </div>
                    </div>
                    <div className={styles.heroVisual}>
                        <div className={styles.floatingCoin} style={{ top: '10%', right: '10%' }}><Bitcoin size={40} /></div>
                        <div className={styles.floatingCoin} style={{ bottom: '20%', left: '10%' }}><Zap size={40} /></div>
                        <Image src="/crypto-phone.png" alt="Crypto App" width={300} height={600} className={styles.phoneImg} />
                    </div>
                </div>
            </section>

            {/* 2. LIVE MARKET TABLE */}
            <section className={styles.marketSection}>
                <div className={styles.container}>
                    <div className={styles.tableCard}>
                        <div className={styles.tableHeader}>
                            <h3>Top Assets</h3>
                            <span className={styles.liveIndicator}><span className={styles.dot}></span> Live Prices</span>
                        </div>
                        <div className={styles.tableWrapper}>
                            <table className={styles.assetTable}>
                                <thead>
                                    <tr>
                                        <th>Asset</th>
                                        <th>Price</th>
                                        <th>24h Change</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cryptoAssets.map((asset) => (
                                        <tr key={asset.symbol}>
                                            <td>
                                                <div className={styles.assetName}>
                                                    <span className={styles.symbolIcon}>{asset.symbol[0]}</span>
                                                    <div>
                                                        <strong>{asset.symbol}</strong> {/* Using Symbol as name for simplicity */}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={styles.price}>{formatPrice(asset.price)}</td>
                                            <td className={asset.change >= 0 ? styles.green : styles.red}>
                                                {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                                            </td>
                                            <td>
                                                <button className={styles.tradeBtn}>Trade</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. SECURITY FEATURES */}
            <section className={styles.featuresSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <h2>Institutional Grade Security</h2>
                        <p>We take the complexity out of custody. Your assets are safe, insured, and accessible.</p>
                    </div>
                    <div className={styles.featureGrid}>
                        <div className={styles.featureCard}>
                            <Lock size={32} className={styles.iconBlue} />
                            <h3>Cold Storage</h3>
                            <p>98% of assets are held offline in geographically distributed air-gapped vaults.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <ShieldCheck size={32} className={styles.iconGreen} />
                            <h3>Insured Custody</h3>
                            <p>We partner with qualified custodians to provide insurance against theft or hacks.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <Globe size={32} className={styles.iconPurple} />
                            <h3>Global Liquidity</h3>
                            <p>Instant execution on large orders through our deep liquidity network.</p>
                        </div>
                    </div>
                </div>
            </section>

        </main>
    );
}