import { getSiteSettings } from "@/lib/content/get-settings";
import { getFinancialReports } from "@/lib/content/get-reports";
import styles from "./investors.module.css";
import Image from "next/image";
import { FileText, PieChart, Download, ExternalLink } from "lucide-react";

export default async function InvestorsPage() {
    const [settings, reports] = await Promise.all([
        getSiteSettings(),
        getFinancialReports()
    ]);

    const isPositive = settings.invest_stock_change.includes("▲") || settings.invest_stock_change.includes("+");

    return (
        <main className={styles.main}>
            <section className={styles.hero}>
                <div className={styles.heroImageWrapper}>
                    <Image
                        src={settings.invest_hero_img}
                        alt={settings.invest_hero_img_alt}
                        fill
                        className={styles.heroImage}
                        priority
                    />
                    <div className={styles.heroOverlay} />
                </div>

                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>{settings.invest_hero_title}</h1>
                    <p className={styles.heroDesc}>{settings.invest_hero_desc}</p>
                </div>
            </section>

            <section className={styles.statsStrip}>
                <div className={styles.container}>
                    <div className={styles.tickerContainer}>
                        <div className={styles.priceBox}>
                            <span className={styles.stockPrice}>{settings.invest_stock_price}</span>
                            <span
                                className={styles.stockChange}
                                style={{ color: isPositive ? 'var(--success)' : 'var(--danger)' }}
                            >
                                {settings.invest_stock_change}
                            </span>
                        </div>
                        <div className={styles.tickerDivider}></div>
                        <div className={styles.marketInfo}>
                            <span className={styles.tickerSymbol}>{settings.invest_ticker_symbol}</span>
                            <span className={styles.marketCap}>{settings.invest_market_cap}</span>
                        </div>
                    </div>
                </div>
            </section>

            <div className={styles.container}>
                <h2 className={styles.sectionTitle}>{settings.invest_reports_title}</h2>

                <div className={styles.grid}>
                    {reports.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>{settings.invest_reports_empty}</p>
                        </div>
                    ) : (
                        reports.map((report) => (
                            <div key={report.id} className={styles.card}>
                                <div className={styles.iconBox}>
                                    {report.type === 'LINK' ? <PieChart size={24} /> : <FileText size={24} />}
                                </div>

                                <h3>{report.title}</h3>
                                <p>{report.summary}</p>

                                <a
                                    href={report.fileUrl}
                                    className={styles.downloadLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {report.type === 'LINK' ? (
                                        <>
                                            {settings.invest_view_link_text} <ExternalLink size={16} />
                                        </>
                                    ) : (
                                        <>
                                            {settings.invest_download_pdf_text} <Download size={16} />
                                        </>
                                    )}
                                </a>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}