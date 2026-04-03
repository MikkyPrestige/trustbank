import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Bitcoin, PieChart, Lock, RefreshCcw } from "lucide-react";
import styles from "./home.module.css";
import { getLiveMarketData } from "@/lib/marketData";
import { getSiteSettings } from "@/lib/content/get-settings";

// format currency
const formatPrice = (num: number, isCrypto: boolean) => {
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
    const [{ assets: marketAssets }, settings] = await Promise.all([
        getLiveMarketData(),
        getSiteSettings()
    ]);

    const tickerItems = [...marketAssets, ...marketAssets];
    const btcAsset = marketAssets.find(a => a.symbol.toUpperCase() === 'BTC');
    const btcDisplayPrice = btcAsset ? formatPrice(btcAsset.price, true) : "$99,000";

    return (
        <section className={styles.investSection}>
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
                            <div className={styles.tickerDivider}></div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.container}>
                <div className={styles.investGrid}>
                    <div className={styles.investContent}>
                        <div className={styles.investHeader}>
                            <h2 className={styles.sectionTitleDark}>
                                {settings.home_invest_title}<br />
                                <span className={styles.highlightBlue}>{settings.home_invest_highlight}</span>
                            </h2>
                            <p className={styles.sectionDescDark}>
                                {settings.home_invest_desc}
                            </p>
                        </div>

                        <div className={styles.investFeatures}>
                            <div className={styles.investFeatureItem}>
                                <div className={styles.iconBoxGlass}>
                                    <PieChart size={24} className={styles.iconBlue} />
                                </div>
                                <div>
                                    <h4>{settings.home_invest_feat1}</h4>
                                    <p>{settings.home_invest_feat1_desc}</p>
                                </div>
                            </div>

                            <div className={styles.investFeatureItem}>
                                <div className={styles.iconBoxGlass}>
                                    <Bitcoin size={24} className={styles.iconGold} />
                                </div>
                                <div>
                                    <h4>{settings.home_invest_feat2}</h4>
                                    <p>{settings.home_invest_feat2_desc}</p>
                                </div>
                            </div>

                            <div className={styles.investFeatureItem}>
                                <div className={styles.iconBoxGlass}>
                                    <Lock size={24} className={styles.iconGreen} />
                                </div>
                                <div>
                                    <h4>{settings.home_invest_feat3}</h4>
                                    <p>{settings.home_invest_feat3_desc}</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.investActions}>
                            <Link href={settings.home_invest_btn1_link} className={styles.btnPrimary}>
                                {settings.home_invest_btn1_text}
                            </Link>
                            <Link href={settings.home_invest_btn2_link} className={styles.linkDark}>
                                {settings.home_invest_btn2_text} <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>

                    <div className={styles.investVisual}>
                        <div className={styles.blueBlob}></div>

                        <div className={styles.phoneWrapper}>
                            <Image
                                src={settings.home_invest_img}
                                alt={`${settings.site_name} ${settings.home_invest_alt}`}
                                width={340}
                                height={680}
                                className={styles.phoneImage}
                            />

                            <div className={styles.floatCardTop}>
                                <div className={styles.floatIconGold}><Bitcoin size={20} /></div>
                                <div>
                                    <span className={styles.floatLabel}>
                                        {settings.home_invest_float1_label}
                                    </span>
                                    <span className={styles.floatValue}>
                                        {btcDisplayPrice}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.floatCardBottom}>
                                <div className={styles.floatIconBlue}><RefreshCcw size={20} /></div>
                                <div>
                                    <span className={styles.floatLabel}>
                                        {settings.home_invest_float2_label}
                                    </span>
                                    <span className={styles.floatValue}>
                                        {settings.home_invest_float2_value}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}