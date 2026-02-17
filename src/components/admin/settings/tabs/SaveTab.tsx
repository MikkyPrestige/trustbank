import ImageUploader from "@/components/admin/media/ImageUploader";
import styles from "../settings.module.css";

interface SaveTabProps {
    settings: any;
    saveHeroUrl: string; setSaveHeroUrl: (url: string) => void;
    saveCdsUrl: string; setSaveCdsUrl: (url: string) => void;
    saveMmaUrl: string; setSaveMmaUrl: (url: string) => void;
    saveKidsUrl: string; setSaveKidsUrl: (url: string) => void;
}

export function SaveTab({
    settings,
    saveHeroUrl, setSaveHeroUrl,
    saveCdsUrl, setSaveCdsUrl,
    saveMmaUrl, setSaveMmaUrl,
    saveKidsUrl, setSaveKidsUrl
}: SaveTabProps) {
    return (
        <div className={styles.grid}>
            {/* --- HERO SECTION --- */}
            <div className={styles.fullWidth}>
                <h3 className={styles.sectionTitle}>Save: Hero</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Headline</label>
                <input name="save_hero_title" defaultValue={settings.save_hero_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Highlight</label>
                <input name="save_hero_highlight" defaultValue={settings.save_hero_highlight} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="save_hero_desc" defaultValue={settings.save_hero_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Hero Background Image" value={saveHeroUrl} onChange={setSaveHeroUrl} />
                <input type="hidden" name="save_hero_img" value={saveHeroUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <input name="save_hero_alt" defaultValue={settings.save_hero_alt} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>FDIC Badge</label>
                <input name="save_fdic_badge" defaultValue={settings.save_fdic_badge} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>APR</label>
                <input name="rate_cd_apy_percent" defaultValue={settings.rate_cd_apy_percent} className={styles.input} />
            </div>

            {/* --- CALCULATOR --- */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Savings Calculator Configuration</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="save_calc_title" defaultValue={settings.save_calc_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Description Prefix</label>
                <input name="save_calc_desc_prefix" defaultValue={settings.save_calc_desc_prefix} className={styles.input} />
            </div>
            {/* CONSTRAINTS & DEFAULTS */}
            <div className={styles.fullWidth}><strong>Slider & Math Logic</strong></div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Max Deposit</label>
                    <input type="number" name="save_calc_max_deposit" defaultValue={settings.save_calc_max_deposit} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Max Monthly</label>
                    <input type="number" name="save_calc_max_monthly" defaultValue={settings.save_calc_max_monthly} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Default APY</label>
                    <input type="number" step="0.01" name="save_calc_default_apy" defaultValue={settings.save_calc_default_apy} className={styles.input} />
                </div>
            </div>
            {/* INPUT LABELS */}
            <div className={styles.fullWidth}><strong>Input Field Labels</strong></div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Initial Deposit</label>
                    <input name="save_calc_label_initial" defaultValue={settings.save_calc_label_initial} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Monthly Contribution</label>
                    <input name="save_calc_label_monthly" defaultValue={settings.save_calc_label_monthly} className={styles.input} />
                </div>
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Duration/Years</label>
                    <input name="save_calc_label_years" defaultValue={settings.save_calc_label_years} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>APY</label>
                    <input name="save_calc_label_apy" defaultValue={settings.save_calc_label_apy} className={styles.input} />
                </div>
            </div>
            {/* RESULTS & LEGEND */}
            <div className={styles.fullWidth}><strong>Result Section Labels</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Result Title</label>
                <input name="save_calc_label_res" defaultValue={settings.save_calc_label_res} className={styles.input} />
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Deposits Legend</label>
                    <input name="save_calc_label_deposits" defaultValue={settings.save_calc_label_deposits} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Interest Legend</label>
                    <input name="save_calc_label_interest" defaultValue={settings.save_calc_label_interest} className={styles.input} />
                </div>
            </div>

            <div className={styles.group}>
                <label className={styles.label}>CTA (Button Text)</label>
                <input name="save_calc_cta" defaultValue={settings.save_calc_cta} className={styles.input} />
            </div>

            {/* --- ANCHOR SECTIONS --- */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Featured Sections</h3>
            </div>
            {/* 1. CDs */}
            <div className={styles.fullWidth}>
                <h4 className={styles.subsectionTitle}>1. Certificates (CDs)</h4>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="save_cds_title" defaultValue={settings.save_cds_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="save_cds_desc" defaultValue={settings.save_cds_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Section Image" value={saveCdsUrl} onChange={setSaveCdsUrl} />
                <input type="hidden" name="save_cds_img" value={saveCdsUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <input name="save_cds_img_alt" defaultValue={settings.save_cds_img_alt} className={styles.input} placeholder="Alt" />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Text</label>
                <input name="save_cds_btn" defaultValue={settings.save_cds_btn} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Anchor Link</label>
                <input name="save_cds_link" defaultValue={settings.save_cds_link} className={styles.input} />
            </div>
            {/* 2. MMA */}
            <div className={styles.fullWidth}>
                <h4 className={styles.subsectionTitle}>2. Money Market (MMA)</h4>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="save_mma_title" defaultValue={settings.save_mma_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="save_mma_desc" defaultValue={settings.save_mma_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Section Image" value={saveMmaUrl} onChange={setSaveMmaUrl} />
                <input type="hidden" name="save_mma_img" value={saveMmaUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <input name="save_mma_img_alt" defaultValue={settings.save_mma_img_alt} className={styles.input} placeholder="Alt" />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Text</label>
                <input name="save_mma_btn" defaultValue={settings.save_mma_btn} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Anchor Link</label>
                <input name="save_mma_link" defaultValue={settings.save_mma_link} className={styles.input} />
            </div>
            {/* 3. Kids */}
            <div className={styles.fullWidth}>
                <h4 className={styles.subsectionTitle}>3. Kids Club</h4>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="save_kids_title" defaultValue={settings.save_kids_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="save_kids_desc" defaultValue={settings.save_kids_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Section Image" value={saveKidsUrl} onChange={setSaveKidsUrl} />
                <input type="hidden" name="save_kids_img" value={saveKidsUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <input name="save_kids_img_alt" defaultValue={settings.save_kids_img_alt} className={styles.input} placeholder="Alt" />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Text</label>
                <input name="save_kids_btn" defaultValue={settings.save_kids_btn} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Anchor Link</label>
                <input name="save_kids_link" defaultValue={settings.save_kids_link} className={styles.input} />
            </div>

            {/* --- SUPPLEMENTAL GRID --- */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>More Options</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Grid Title</label>
                <input name="save_prod_title" defaultValue={settings.save_prod_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Grid Description</label>
                <textarea name="save_prod_subtitle" defaultValue={settings.save_prod_subtitle} className={styles.textarea} />
            </div>

            <div className={styles.fullWidth}><strong>1. High Yield Savings</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="save_prod1_title" defaultValue={settings.save_prod1_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="save_prod1_desc" defaultValue={settings.save_prod1_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Text</label>
                <input name="save_prod1_link" defaultValue={settings.save_prod1_link} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Anchor Link</label>
                <input name="save_prod1_anchorLink" defaultValue={settings.save_prod1_anchorLink} className={styles.input} />
            </div>
            <div className={styles.fullWidth}><strong>2. Business Savings</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="save_prod2_title" defaultValue={settings.save_prod2_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="save_prod2_desc" defaultValue={settings.save_prod2_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button text</label><input name="save_prod2_link" defaultValue={settings.save_prod2_link} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Anchor Link</label><input name="save_prod2_anchorLink" defaultValue={settings.save_prod2_anchorLink} className={styles.input} />
            </div>
            <div className={styles.fullWidth}><strong>3. Retirement IRA</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="save_prod3_title" defaultValue={settings.save_prod3_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="save_prod3_desc" defaultValue={settings.save_prod3_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button text</label>
                <input name="save_prod3_link" defaultValue={settings.save_prod3_link} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Anchor Link</label><input name="save_prod3_anchorLink" defaultValue={settings.save_prod3_anchorLink} className={styles.input} />
            </div>

            {/* --- TRUST BADGES --- */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} /><h3 className={styles.sectionTitle}>Trust Section</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="save_trust_title" defaultValue={settings.save_trust_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="save_trust_desc" defaultValue={settings.save_trust_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Badge 1</label>
                <input name="save_trust_badge_1" defaultValue={settings.save_trust_badge_1} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Badge 2</label>
                <input name="save_trust_badge_2" defaultValue={settings.save_trust_badge_2} className={styles.input} />
            </div>
        </div>
    );
}