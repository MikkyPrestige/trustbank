import { getSiteSettings } from "@/lib/get-settings";
import styles from "./investors.module.css";
import { FileText, PieChart, Download, ExternalLink } from "lucide-react";

export default async function InvestorsPage() {
    const settings = await getSiteSettings();

    return (
        <main className={styles.main}>
            <section className={styles.hero}>
                <h1 className={styles.heroTitle}>Investor Relations</h1>
                <p className={styles.heroDesc}>
                    Financial information and corporate governance for shareholders of {settings.site_name}.
                </p>
            </section>

            {/* STOCK TICKER MOCK */}
            <section className={styles.statsStrip}>
                <div className={styles.container}>
                    <div className={styles.tickerContainer}>
                        <div className={styles.priceBox}>
                            <span className={styles.stockPrice}>$142.50</span>
                            <span className={styles.stockChange}>▲ 1.2%</span>
                        </div>

                        <div className={styles.tickerDivider}></div>

                        <div>
                            <span className={styles.tickerSymbol}>NYSE: TRST</span>
                            <span className={styles.marketCap}>Market Cap: $12.4B</span>
                        </div>
                    </div>
                </div>
            </section>

            <div className={styles.container}>
                <h2 className={styles.sectionTitle}>Financial Reports</h2>
                <div className={styles.grid}>
                    {/* Q3 Report */}
                    <div className={styles.card}>
                        <div className={styles.iconBox}><FileText size={24} /></div>
                        <h3>Q3 2024 Earnings</h3>
                        <p>Quarterly report ending Sept 30, 2024.</p>
                        <a href="#" className={styles.downloadLink}>
                            Download PDF <Download size={16} />
                        </a>
                    </div>

                    {/* Annual Report */}
                    <div className={styles.card}>
                        <div className={styles.iconBox}><FileText size={24} /></div>
                        <h3>2023 Annual Report</h3>
                        <p>Full year fiscal audit and review.</p>
                        <a href="#" className={styles.downloadLink}>
                            Download PDF <Download size={16} />
                        </a>
                    </div>

                    {/* SEC Filings */}
                    <div className={styles.card}>
                        <div className={styles.iconBox}><PieChart size={24} /></div>
                        <h3>SEC Filings</h3>
                        <p>View all 10-K and 8-K filings directly on EDGAR.</p>
                        <a href="#" className={styles.downloadLink}>
                            View External <ExternalLink size={16} />
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
}