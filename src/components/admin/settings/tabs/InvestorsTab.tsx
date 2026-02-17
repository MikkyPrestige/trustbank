import Link from "next/link";
import ImageUploader from "@/components/admin/media/ImageUploader";
import { TrendingUp, ArrowRight } from "lucide-react";
import styles from "../settings.module.css";

interface InvestorsTabProps {
    settings: any;
    investHeroUrl: string;
    setInvestHeroUrl: (url: string) => void;
}

export function InvestorsTab({ settings, investHeroUrl, setInvestHeroUrl }: InvestorsTabProps) {
    return (
        <div className={styles.grid}>

            {/* --- 1. DATA MANAGEMENT LINK --- */}
            <div className={styles.fullWidth}>
                <h3 className={styles.sectionTitle}>Reports Database</h3>
                <p className={styles.sectionSubtitle}>Manage financial statements and earnings reports.</p>
            </div>

            <Link href="/admin/investors" className={styles.navCard}>
                <div className={`${styles.navIcon} ${styles.iconPrimary}`}>
                    <TrendingUp size={24} />
                </div>
                <div className={styles.navText}>
                    <h4 className={styles.navTitle}>Manage Reports</h4>
                    <p className={styles.navSubtitle}>Upload PDFs or add external links</p>
                </div>
                <ArrowRight size={16} className={styles.chevron} />
            </Link>

            {/* --- 2. PAGE CONFIG --- */}
            <div className={`${styles.fullWidth} ${styles.marginTop}`}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Investors Page Configuration</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Hero Title</label>
                <input name="invest_hero_title" defaultValue={settings.invest_hero_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Hero Description</label>
                <textarea name="invest_hero_desc" defaultValue={settings.invest_hero_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Hero Background Image" value={investHeroUrl} onChange={setInvestHeroUrl} />
                <input type="hidden" name="invest_hero_img" value={investHeroUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <input name="invest_hero_img_alt" defaultValue={settings.invest_hero_img_alt} className={styles.input} />
            </div>
            {/* Stock Ticker */}
            <div className={styles.fullWidth}>
                <h4 className={styles.subsectionTitle}>Stock Ticker Data</h4>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Stock Price</label>
                <input name="invest_stock_price" defaultValue={settings.invest_stock_price} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Change %</label>
                <input name="invest_stock_change" defaultValue={settings.invest_stock_change} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Ticker Symbol</label>
                <input name="invest_ticker_symbol" defaultValue={settings.invest_ticker_symbol} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Market Cap</label>
                <input name="invest_market_cap" defaultValue={settings.invest_market_cap} className={styles.input} />
            </div>

            <div className={styles.fullWidth}>
                <h4 className={styles.subsectionTitle}>UI Labels</h4>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Reports Title</label>
                <input name="invest_reports_title" defaultValue={settings.invest_reports_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Reports Empty State</label>
                <input name="invest_reports_empty" defaultValue={settings.invest_reports_empty} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Download Btn</label>
                <input name="invest_download_pdf_text" defaultValue={settings.invest_download_pdf_text} className={styles.input} />
            </div>
        </div>
    );
}