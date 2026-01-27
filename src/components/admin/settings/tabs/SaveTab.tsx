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
            <div className={styles.fullWidth}><h3 className={styles.sectionTitle}>Save: Hero</h3></div>
            <div className={styles.group}><label className={styles.label}>Headline</label><input name="save_hero_title" defaultValue={settings.save_hero_title} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Highlight (Blue)</label><input name="save_hero_highlight" defaultValue={settings.save_hero_highlight} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><label className={styles.label}>Description</label><textarea name="save_hero_desc" defaultValue={settings.save_hero_desc} className={styles.textarea} /></div>
            <div className={styles.group}><ImageUploader label="Hero Image" value={saveHeroUrl} onChange={setSaveHeroUrl} /><input type="hidden" name="save_hero_img" value={saveHeroUrl} /></div>
            <div className={styles.group}><label className={styles.label}>Alt Text</label><input name="save_hero_alt" defaultValue={settings.save_hero_alt} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>FDIC Badge</label><input name="save_fdic_badge" defaultValue={settings.save_fdic_badge} className={styles.input} /></div>

            {/* --- CALCULATOR --- */}
            <div className={styles.fullWidth}><hr className={styles.divider} /><h3 className={styles.sectionTitle}>Calculator Labels</h3></div>
            <div className={styles.group}><label className={styles.label}>Title</label><input name="save_calc_title" defaultValue={settings.save_calc_title} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Desc Prefix</label><input name="save_calc_desc_prefix" defaultValue={settings.save_calc_desc_prefix} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>CTA Button</label><input name="save_calc_cta" defaultValue={settings.save_calc_cta} className={styles.input} /></div>

            {/* --- ANCHOR SECTIONS --- */}
            <div className={styles.fullWidth}><hr className={styles.divider} /><h3 className={styles.sectionTitle}>Featured Sections</h3></div>

            {/* 1. CDs */}
            <div className={styles.fullWidth}><h4 className={styles.subsectionTitle}>1. Certificates (CDs)</h4></div>
            <div className={styles.group}><input name="save_cds_title" defaultValue={settings.save_cds_title} className={styles.input} /></div>
            <div className={styles.group}><input name="save_cds_btn" defaultValue={settings.save_cds_btn} className={styles.input} /></div>
            <div className={styles.group}><ImageUploader label="Image" value={saveCdsUrl} onChange={setSaveCdsUrl} /><input type="hidden" name="save_cds_img" value={saveCdsUrl} /></div>
            <div className={styles.group}><input name="save_cds_img_alt" defaultValue={settings.save_cds_img_alt} className={styles.input} placeholder="Alt" /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><textarea name="save_cds_desc" defaultValue={settings.save_cds_desc} className={styles.textarea} /></div>

            {/* 2. MMA */}
            <div className={styles.fullWidth}><h4 className={styles.subsectionTitle}>2. Money Market (MMA)</h4></div>
            <div className={styles.group}><input name="save_mma_title" defaultValue={settings.save_mma_title} className={styles.input} /></div>
            <div className={styles.group}><input name="save_mma_btn" defaultValue={settings.save_mma_btn} className={styles.input} /></div>
            <div className={styles.group}><ImageUploader label="Image" value={saveMmaUrl} onChange={setSaveMmaUrl} /><input type="hidden" name="save_mma_img" value={saveMmaUrl} /></div>
            <div className={styles.group}><input name="save_mma_img_alt" defaultValue={settings.save_mma_img_alt} className={styles.input} placeholder="Alt" /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><textarea name="save_mma_desc" defaultValue={settings.save_mma_desc} className={styles.textarea} /></div>

            {/* 3. Kids */}
            <div className={styles.fullWidth}><h4 className={styles.subsectionTitle}>3. Kids Club</h4></div>
            <div className={styles.group}><input name="save_kids_title" defaultValue={settings.save_kids_title} className={styles.input} /></div>
            <div className={styles.group}><input name="save_kids_btn" defaultValue={settings.save_kids_btn} className={styles.input} /></div>
            <div className={styles.group}><ImageUploader label="Image" value={saveKidsUrl} onChange={setSaveKidsUrl} /><input type="hidden" name="save_kids_img" value={saveKidsUrl} /></div>
            <div className={styles.group}><input name="save_kids_img_alt" defaultValue={settings.save_kids_img_alt} className={styles.input} placeholder="Alt" /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><textarea name="save_kids_desc" defaultValue={settings.save_kids_desc} className={styles.textarea} /></div>

            {/* --- SUPPLEMENTAL GRID --- */}
            <div className={styles.fullWidth}><hr className={styles.divider} /><h3 className={styles.sectionTitle}>More Options (Grid)</h3></div>
            <div className={styles.group}><label className={styles.label}>Grid Title</label><input name="save_prod_title" defaultValue={settings.save_prod_title} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><label className={styles.label}>Grid Desc</label><input name="save_prod_subtitle" defaultValue={settings.save_prod_subtitle} className={styles.input} /></div>

            <div className={styles.fullWidth}><strong>1. High Yield Savings</strong></div>
            <div className={styles.group}><input name="save_prod1_title" defaultValue={settings.save_prod1_title} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><textarea name="save_prod1_desc" defaultValue={settings.save_prod1_desc} className={styles.textarea} /></div>
            <div className={styles.group}><label className={styles.label}>Button</label><input name="save_prod1_link" defaultValue={settings.save_prod1_link} className={styles.input} /></div>

            <div className={styles.fullWidth}><strong>5. Business Savings</strong></div>
            <div className={styles.group}><input name="save_prod5_title" defaultValue={settings.save_prod5_title} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><textarea name="save_prod5_desc" defaultValue={settings.save_prod5_desc} className={styles.textarea} /></div>
            <div className={styles.group}><label className={styles.label}>Button</label><input name="save_prod5_link" defaultValue={settings.save_prod5_link} className={styles.input} /></div>

            <div className={styles.fullWidth}><strong>6. Retirement IRA</strong></div>
            <div className={styles.group}><input name="save_prod6_title" defaultValue={settings.save_prod6_title} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><textarea name="save_prod6_desc" defaultValue={settings.save_prod6_desc} className={styles.textarea} /></div>
            <div className={styles.group}><label className={styles.label}>Button</label><input name="save_prod6_link" defaultValue={settings.save_prod6_link} className={styles.input} /></div>

            {/* --- TRUST BADGES --- */}
            <div className={styles.fullWidth}><hr className={styles.divider} /><h3 className={styles.sectionTitle}>Trust Section</h3></div>
            <div className={styles.group}><label className={styles.label}>Title</label><input name="save_trust_title" defaultValue={settings.save_trust_title} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><textarea name="save_trust_desc" defaultValue={settings.save_trust_desc} className={styles.textarea} /></div>
            <div className={styles.group}><label className={styles.label}>Badge 1</label><input name="save_trust_badge_1" defaultValue={settings.save_trust_badge_1} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Badge 2</label><input name="save_trust_badge_2" defaultValue={settings.save_trust_badge_2} className={styles.input} /></div>
        </div>
    );
}