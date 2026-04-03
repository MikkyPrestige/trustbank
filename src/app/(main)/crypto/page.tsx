import { getSiteSettings } from "@/lib/content/get-settings";
import { getLiveMarketData } from "@/lib/marketData";
import Image from "next/image";
import Link from "next/link";
import { Bitcoin, ShieldCheck, Zap, Globe, Lock } from "lucide-react";
import styles from "./crypto.module.css";

export default async function CryptoPage() {
    const [settings, marketData] = await Promise.all([
        getSiteSettings(),
        getLiveMarketData()
    ]);

    // const cryptoAssets = marketData.assets.filter(item => item.isCrypto);
    const allAssets = marketData.assets;

    const timeString = marketData.lastUpdated.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });

    const formatPrice = (num: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: num < 1 ? 4 : 2,
            maximumFractionDigits: num < 1 ? 6 : 2
        }).format(num);
    };

    return (
        <main className={styles.main}>
            <section className={styles.hero}>
                <div className={styles.container}>
                    <div className={styles.heroGrid}>
                        <div className={styles.heroContent}>
                            <div className={styles.badge}><Bitcoin size={16} /> {settings.crypto_hero_badge}</div>
                            <h1 className={styles.heroTitle}>
                                {settings.crypto_hero_title} <br />
                                <span className={styles.highlight}>{settings.crypto_hero_highlight}</span>
                            </h1>
                            <p className={styles.heroDesc}>{settings.crypto_hero_desc}</p>
                            <div className={styles.heroActions}>
                                <Link href={settings.crypto_hero_btn_primary_link} className={styles.btnPrimary}>
                                    {settings.crypto_hero_btn_primary}
                                </Link>
                                <Link href={settings.crypto_hero_btn_secondary_link} className={styles.btnSecondary}>
                                    {settings.crypto_hero_btn_secondary}
                                </Link>
                            </div>
                        </div>

                        <div className={styles.heroVisual}>
                            {/* <div className={styles.floatingCoin} style={{ top: '10%', right: '10%' }}><Bitcoin size={40} /></div> */}
                            <div className={styles.floatingCoin} style={{ bottom: '20%', left: '10%', animationDelay: '1s' }}><Zap size={40} /></div>

                            <div className={styles.phoneWrapper}>
                                <Image
                                    src={settings.crypto_hero_img}
                                    alt={settings.crypto_hero_alt}
                                    fill
                                    className={styles.phoneImg}
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.marketSection}>
                <div className={styles.container}>
                    <div className={styles.tableCard}>
                        <div className={styles.tableHeader}>
                            <h3>{settings.crypto_table_title}</h3>
                            <span className={styles.liveIndicator}>
                                <span className={styles.dot}></span> {settings.crypto_table_subtitle}
                            </span>
                        </div>
                        <div className={styles.tableWrapper}>
                            <table className={styles.assetTable}>
                                <thead>
                                    <tr>
                                        <th>{settings.crypto_th1}</th>
                                        <th>{settings.crypto_th2}</th>
                                        <th>{settings.crypto_th3}</th>
                                        <th>{settings.crypto_th4}</th>
                                        <th>{settings.crypto_th5}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allAssets.map((asset) => {
                                        const displayIcon = asset.iconUrl || `/assets/${asset.symbol.toLowerCase()}.png`;
                                        const isFresh = asset.lastUpdated &&
                                            (new Date().getTime() - new Date(asset.lastUpdated).getTime() < 60000);

                                        return (
                                            <tr key={asset.id || asset.symbol}>
                                                <td>
                                                    <div className={styles.assetName}>
                                                        <div className={styles.symbolIcon}>
                                                            <Image
                                                                src={displayIcon}
                                                                alt={asset.name}
                                                                width={32}
                                                                height={32}
                                                                unoptimized
                                                                className={styles.coinLogo}
                                                            />
                                                        </div>

                                                        <div className={styles.assetMeta}>
                                                            <div className={styles.symbolContainer}>
                                                                <strong>{asset.symbol}</strong>
                                                                {!asset.isLive && (
                                                                    <span className={styles.staleDot} title="Using Last Known Price">●</span>
                                                                )}
                                                            </div>
                                                            <span className={styles.assetFullname}>{asset.name}</span>
                                                            <span className={`${styles.lastUpdatedTiny} ${isFresh ? styles.isFresh : ''}`}>
                                                                {asset.lastUpdated ? formatRelativeTime(asset.lastUpdated) : 'Never'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={styles.price}>{formatPrice(asset.price)}</td>
                                                <td className={asset.change >= 0 ? styles.green : styles.red}>
                                                    {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                                                </td>
                                                <td className={styles.chartCell}>
                                                    <Sparkline
                                                        data={asset.sparkline}
                                                        color={asset.change >= 0 ? 'var(--success)' : 'var(--danger)'}
                                                    />
                                                </td>
                                                <td>
                                                    <Link href={`${settings.crypto_tb_link}${asset.symbol}`} className={styles.tradeBtn}>
                                                        {settings.crypto_tb_link_text}
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.featuresSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <h2>{settings.crypto_sec_title}</h2>
                        <p>{settings.crypto_sec_desc}</p>
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

function Sparkline({ data, color }: { data: any, color: string }) {
    let pointsArray = Array.isArray(data) ? [...data] : [];

    if (pointsArray.length < 2) {
        return (
            <div style={{ width: '100px', height: '30px', display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            </div>
        );
    }

    const isFlat = pointsArray.every(val => val === pointsArray[0]);
    if (isFlat) {
        pointsArray = pointsArray.map((val, i) => val + (Math.sin(i) * (val * 0.0001)));
    }

    const min = Math.min(...pointsArray);
    const max = Math.max(...pointsArray);
    const range = (max - min) || (min * 0.001);
    const width = 100;
    const height = 30;

    const points = pointsArray.map((val: number, i: number) => {
        const x = (i / (pointsArray.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
            />
        </svg>
    );
}


function formatRelativeTime(date: Date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}