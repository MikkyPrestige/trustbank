import { getSiteSettings } from "@/lib/content/get-settings";
import { getLiveMarketData } from "@/lib/marketData";
import Image from "next/image";
import Link from "next/link";
import { Bitcoin, ShieldCheck, Zap, Globe, Lock, ArrowRight } from "lucide-react";
import styles from "./crypto.module.css";

export default async function CryptoPage() {
    // 1. Parallel Fetching for speed
    const [settings, marketData] = await Promise.all([
        getSiteSettings(),
        getLiveMarketData()
    ]);

    // 2. Filter for Crypto only (Generic logic assuming 'type' or similar exists, or just taking top 5)
    // Adjust logic based on your actual marketData structure
    const cryptoAssets = marketData.filter(item => item.isCrypto).slice(0, 5);

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
                    <div className={styles.heroGrid}>
                        <div className={styles.heroContent}>
                            <div className={styles.badge}><Bitcoin size={16} /> Crypto 2.0</div>
                            <h1 className={styles.heroTitle}>
                                {settings.crypto_hero_title} <br />
                                <span className={styles.highlight}>{settings.crypto_hero_highlight}</span>
                            </h1>
                            <p className={styles.heroDesc}>{settings.crypto_hero_desc}</p>
                            <div className={styles.heroActions}>
                                {/* CMS Controlled Buttons */}
                                <Link href="/register" className={styles.btnPrimary}>
                                    {settings.crypto_hero_btn_primary || "Start Trading"}
                                </Link>
                                <Link href="/learn" className={styles.btnSecondary}>
                                    {settings.crypto_hero_btn_secondary || "Learn Crypto"}
                                </Link>
                            </div>
                        </div>

                        <div className={styles.heroVisual}>
                            <div className={styles.floatingCoin} style={{ top: '10%', right: '10%' }}><Bitcoin size={40} /></div>
                            <div className={styles.floatingCoin} style={{ bottom: '20%', left: '10%', animationDelay: '1s' }}><Zap size={40} /></div>

                            <div className={styles.phoneWrapper}>
                                <Image
                                    src={settings.crypto_hero_img || "/crypto-phone.png"}
                                    alt={settings.crypto_hero_alt || "Crypto App"}
                                    fill
                                    className={styles.phoneImg}
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. LIVE MARKET TABLE */}
            <section className={styles.marketSection}>
                <div className={styles.container}>
                    <div className={styles.tableCard}>
                        <div className={styles.tableHeader}>
                            <h3>{settings.crypto_table_title || "Top Assets"}</h3>
                            <span className={styles.liveIndicator}>
                                <span className={styles.dot}></span> Live Prices
                            </span>
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
                                                    <div className={styles.assetMeta}>
                                                        <strong>{asset.symbol}</strong>
                                                        <span className={styles.assetFullname}>Bitcoin</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={styles.price}>{formatPrice(asset.price)}</td>
                                            <td className={asset.change >= 0 ? styles.green : styles.red}>
                                                {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                                            </td>
                                            <td>
                                                <Link href={`/trade/${asset.symbol}`} className={styles.tradeBtn}>
                                                    Trade
                                                </Link>
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
                        <h2>{settings.crypto_sec_title || "Institutional Grade Security"}</h2>
                        <p>{settings.crypto_sec_desc || "We take the complexity out of custody."}</p>
                    </div>
                    <div className={styles.featureGrid}>
                        <div className={styles.featureCard}>
                            <div className={styles.iconBox}><Lock size={32} className={styles.iconBlue} /></div>
                            <h3>{settings.crypto_feat1_title}</h3>
                            <p>{settings.crypto_feat1_desc}</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.iconBox}><ShieldCheck size={32} className={styles.iconGreen} /></div>
                            <h3>{settings.crypto_feat2_title}</h3>
                            <p>{settings.crypto_feat2_desc}</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.iconBox}><Globe size={32} className={styles.iconPurple} /></div>
                            <h3>{settings.crypto_feat3_title}</h3>
                            <p>{settings.crypto_feat3_desc}</p>
                        </div>
                    </div>
                </div>
            </section>

        </main>
    );
}