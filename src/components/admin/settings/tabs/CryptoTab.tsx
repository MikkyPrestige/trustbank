import ImageUploader from "@/components/admin/media/ImageUploader";
import styles from "../settings.module.css";

interface CryptoTabProps {
    settings: any;
    cryptoHeroUrl: string; setCryptoHeroUrl: (url: string) => void;
}

export function CryptoTab({ settings, cryptoHeroUrl, setCryptoHeroUrl }: CryptoTabProps) {
    return (
        <div className={styles.grid}>

            {/* --- HERO SECTION --- */}
            <div className={styles.fullWidth}><h3 className={styles.sectionTitle}>Crypto: Hero</h3></div>
            <div className={styles.group}><label className={styles.label}>Headline</label><input name="crypto_hero_title" defaultValue={settings.crypto_hero_title} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Highlight (Purple)</label><input name="crypto_hero_highlight" defaultValue={settings.crypto_hero_highlight} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><label className={styles.label}>Description</label><textarea name="crypto_hero_desc" defaultValue={settings.crypto_hero_desc} className={styles.textarea} /></div>

            <div className={styles.group}><ImageUploader label="App Image (Phone)" value={cryptoHeroUrl} onChange={setCryptoHeroUrl} /><input type="hidden" name="crypto_hero_img" value={cryptoHeroUrl} /></div>
            <div className={styles.group}><label className={styles.label}>Alt Text</label><input name="crypto_hero_alt" defaultValue={settings.crypto_hero_alt} className={styles.input} /></div>

            <div className={styles.group}><label className={styles.label}>Primary Button</label><input name="crypto_hero_btn_primary" defaultValue={settings.crypto_hero_btn_primary} className={styles.input} placeholder="Start Trading" /></div>
            <div className={styles.group}><label className={styles.label}>Secondary Button</label><input name="crypto_hero_btn_secondary" defaultValue={settings.crypto_hero_btn_secondary} className={styles.input} placeholder="Learn Crypto" /></div>

            {/* --- TABLE SECTION --- */}
            <div className={styles.fullWidth}><hr className={styles.divider} /><h3 className={styles.sectionTitle}>Market Table</h3></div>
            <div className={styles.group}><label className={styles.label}>Table Title</label><input name="crypto_table_title" defaultValue={settings.crypto_table_title} className={styles.input} /></div>

            {/* --- FEATURES SECTION --- */}
            <div className={styles.fullWidth}><hr className={styles.divider} /><h3 className={styles.sectionTitle}>Security Features</h3></div>
            <div className={styles.group}><label className={styles.label}>Section Title</label><input name="crypto_sec_title" defaultValue={settings.crypto_sec_title} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><label className={styles.label}>Section Description</label><input name="crypto_sec_desc" defaultValue={settings.crypto_sec_desc} className={styles.input} /></div>

            {/* Feature 1 */}
            <div className={styles.fullWidth}><strong>1. Cold Storage</strong></div>
            <div className={styles.group}><input name="crypto_feat1_title" defaultValue={settings.crypto_feat1_title} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><textarea name="crypto_feat1_desc" defaultValue={settings.crypto_feat1_desc} className={styles.textarea} /></div>

            {/* Feature 2 */}
            <div className={styles.fullWidth}><strong>2. Insurance</strong></div>
            <div className={styles.group}><input name="crypto_feat2_title" defaultValue={settings.crypto_feat2_title} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><textarea name="crypto_feat2_desc" defaultValue={settings.crypto_feat2_desc} className={styles.textarea} /></div>

            {/* Feature 3 */}
            <div className={styles.fullWidth}><strong>3. Liquidity</strong></div>
            <div className={styles.group}><input name="crypto_feat3_title" defaultValue={settings.crypto_feat3_title} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><textarea name="crypto_feat3_desc" defaultValue={settings.crypto_feat3_desc} className={styles.textarea} /></div>

        </div>
    );
}