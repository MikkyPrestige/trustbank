import ImageUploader from "@/components/admin/media/ImageUploader";
import styles from "../settings.module.css";

interface BorrowTabProps {
    settings: any;
    borrowHeroUrl: string;
    setBorrowHeroUrl: (url: string) => void;
    borrowCCUrl: string; setBorrowCCUrl: (url: string) => void;
    borrowPLUrl: string; setBorrowPLUrl: (url: string) => void;
    borrowMTUrl: string; setBorrowMTUrl: (url: string) => void;
    borrowALUrl: string; setBorrowALUrl: (url: string) => void;
    borrowSLUrl: string; setBorrowSLUrl: (url: string) => void;
    borrowHeUrl: string; setBorrowHeUrl: (url: string) => void;
}

export function BorrowTab({ settings, borrowHeroUrl, setBorrowHeroUrl, borrowCCUrl, setBorrowCCUrl, borrowPLUrl, setBorrowPLUrl, borrowMTUrl, setBorrowMTUrl, borrowALUrl, setBorrowALUrl, borrowSLUrl, setBorrowSLUrl, borrowHeUrl, setBorrowHeUrl }: BorrowTabProps) {
    return (
        <div className={styles.grid}>
            {/* --- HERO SECTION --- */}
            <div className={styles.fullWidth}>
                <h3 className={styles.sectionTitle}>Borrow: Hero</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Headline</label>
                <input name="borrow_hero_title" defaultValue={settings.borrow_hero_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Highlight</label>
                <input name="borrow_hero_highlight" defaultValue={settings.borrow_hero_highlight} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="borrow_hero_desc" defaultValue={settings.borrow_hero_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Hero Image" value={borrowHeroUrl} onChange={setBorrowHeroUrl} />
                <input type="hidden" name="borrow_hero_img" value={borrowHeroUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Alt Text</label>
                <input name="borrow_hero_alt" defaultValue={settings.borrow_hero_alt} className={styles.input} />
            </div>
            {/* Stats */}
            <div className={styles.fullWidth}>
                <strong>Hero Stats</strong>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Funded Stat</label>
                <input name="borrow_stat_funded" defaultValue={settings.borrow_stat_funded} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Speed Stat</label>
                <input name="borrow_stat_speed" defaultValue={settings.borrow_stat_speed} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Approval Stat</label>
                <input name="borrow_stat_approval" defaultValue={settings.borrow_stat_approval} className={styles.input} />
            </div>

            {/* --- CALCULATOR LABELS --- */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Calculator Labels</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label><input name="borrow_calc_title" defaultValue={settings.borrow_calc_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Subtitle</label><input name="borrow_calc_desc" defaultValue={settings.borrow_calc_desc} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Amount Label</label><input name="borrow_calc_label_amt" defaultValue={settings.borrow_calc_label_amt} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Term Label</label><input name="borrow_calc_label_term" defaultValue={settings.borrow_calc_label_term} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Rate Label</label><input name="borrow_calc_label_rate" defaultValue={settings.borrow_calc_label_rate} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Result Label</label><input name="borrow_calc_res_monthly" defaultValue={settings.borrow_calc_res_monthly} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>CTA Button</label>
                <input name="borrow_calc_cta" defaultValue={settings.borrow_calc_cta} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Principal Label</label>
                <input name="borrow_calc_label_princ" defaultValue={settings.borrow_calc_label_princ} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Interest Label</label>
                <input name="borrow_calc_label_int" defaultValue={settings.borrow_calc_label_int} className={styles.input} />
            </div>

            {/* --- PRODUCT SECTIONS (ANCHORS) --- */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Product Sections</h3>
            </div>
            <div className={styles.fullWidth}>
                <h4 className={styles.subsectionTitle}>Global Button Text</h4>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Link Text</label>
                <input name="borrow_prod_btn_text" defaultValue={settings.borrow_prod_btn_text} className={styles.input} placeholder="e.g. Check Rates" />
            </div>
            {/* 1. Credit Cards (#cc) */}
            <div className={styles.fullWidth}>
                <h4 className={styles.subsectionTitle}>1. Credit Cards (#cc)</h4>
            </div>
            <div className={styles.group}>
                <input name="borrow_cc_title" defaultValue={settings.borrow_cc_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <input name="borrow_cc_btn" defaultValue={settings.borrow_cc_btn} className={styles.input} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Image" value={borrowCCUrl} onChange={setBorrowCCUrl} />
                <input type="hidden" name="borrow_cc_img" value={borrowCCUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Alt Text</label>
                <input name="borrow_cc_img_alt" defaultValue={settings.borrow_cc_img_alt} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <textarea name="borrow_cc_desc" defaultValue={settings.borrow_cc_desc} className={styles.textarea} />
            </div>
            {/* 2. Personal Loans (#pl) */}
            <div className={styles.fullWidth}>
                <h4 className={styles.subsectionTitle}>2. Personal Loans (#pl)</h4>
            </div>
            <div className={styles.group}>
                <input name="borrow_pl_title" defaultValue={settings.borrow_pl_title} className={styles.input} /></div>
            <div className={styles.group}>
                <input name="borrow_pl_btn" defaultValue={settings.borrow_pl_btn} className={styles.input} /></div>
            <div className={styles.group}>
                <ImageUploader label="Image" value={borrowPLUrl} onChange={setBorrowPLUrl} />
                <input type="hidden" name="borrow_pl_img" value={borrowPLUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Alt Text</label>
                <input name="borrow_pl_img_alt" defaultValue={settings.borrow_pl_img_alt} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <textarea name="borrow_pl_desc" defaultValue={settings.borrow_pl_desc} className={styles.textarea} />
            </div>
            {/* 3. Mortgages (#mt) */}
            <div className={styles.fullWidth}>
                <h4 className={styles.subsectionTitle}>3. Mortgages (#mt)</h4>
            </div>
            <div className={styles.group}>
                <input name="borrow_mt_title" defaultValue={settings.borrow_mt_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <input name="borrow_mt_btn" defaultValue={settings.borrow_mt_btn} className={styles.input} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Image" value={borrowMTUrl} onChange={setBorrowMTUrl} />
                <input type="hidden" name="borrow_mt_img" value={borrowMTUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Alt Text</label>
                <input name="borrow_mt_img_alt" defaultValue={settings.borrow_mt_img_alt} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <textarea name="borrow_mt_desc" defaultValue={settings.borrow_mt_desc} className={styles.textarea} />
            </div>
            {/* 4. Auto Loans (#al) */}
            <div className={styles.fullWidth}>
                <h4 className={styles.subsectionTitle}>4. Auto Loans (#al)</h4>
            </div>
            <div className={styles.group}>
                <input name="borrow_al_title" defaultValue={settings.borrow_al_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <input name="borrow_al_btn" defaultValue={settings.borrow_al_btn} className={styles.input} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Image" value={borrowALUrl} onChange={setBorrowALUrl} />
                <input type="hidden" name="borrow_al_img" value={borrowALUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Alt Text</label>
                <input name="borrow_al_img_alt" defaultValue={settings.borrow_al_img_alt} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <textarea name="borrow_al_desc" defaultValue={settings.borrow_al_desc} className={styles.textarea} />
            </div>
            {/* 5. Student Loans (#sl) */}
            <div className={styles.fullWidth}>
                <h4 className={styles.subsectionTitle}>5. Student Loans (#sl)</h4>
            </div>
            <div className={styles.group}>
                <input name="borrow_sl_title" defaultValue={settings.borrow_sl_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <input name="borrow_sl_btn" defaultValue={settings.borrow_sl_btn} className={styles.input} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Image" value={borrowSLUrl} onChange={setBorrowSLUrl} />
                <input type="hidden" name="borrow_sl_img" value={borrowSLUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Alt Text</label>
                <input name="borrow_sl_img_alt" defaultValue={settings.borrow_sl_img_alt} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <textarea name="borrow_sl_desc" defaultValue={settings.borrow_sl_desc} className={styles.textarea} />
            </div>
            <div className={styles.fullWidth}>
                <h4 className={styles.subsectionTitle}>6. Home Equity (#he)</h4>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="borrow_he_title" defaultValue={settings.borrow_he_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Text</label>
                <input name="borrow_he_btn" defaultValue={settings.borrow_he_btn} className={styles.input} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Section Image" value={borrowHeUrl} onChange={setBorrowHeUrl} />
                <input type="hidden" name="borrow_he_img" value={borrowHeUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt</label>
                <input name="borrow_he_alt" defaultValue={settings.borrow_he_alt} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <input name="borrow_he_desc" defaultValue={settings.borrow_he_desc} className={styles.input} />
            </div>

            {/* --- LOAN GRID CONFIG --- */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Loan Grid Section</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Section Title</label>
                <input name="borrow_grid_title" defaultValue={settings.borrow_grid_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Section Subtitle</label>
                <input name="borrow_grid_desc" defaultValue={settings.borrow_grid_desc} className={styles.input} />
            </div>
            {/* Prod 1 */}
            <div className={styles.fullWidth}>
                <strong>1. Personal Loans</strong>
            </div>
            <div className={styles.group}>
                <input name="borrow_prod1_title" defaultValue={settings.borrow_prod1_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <textarea name="borrow_prod1_desc" defaultValue={settings.borrow_prod1_desc} className={styles.textarea} />
            </div>
            {/* Prod 2 */}
            <div className={styles.fullWidth}>
                <strong>2. Mortgages</strong>
            </div>
            <div className={styles.group}>
                <input name="borrow_prod2_title" defaultValue={settings.borrow_prod2_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <textarea name="borrow_prod2_desc" defaultValue={settings.borrow_prod2_desc} className={styles.textarea} />
            </div>
            {/* Prod 3 */}
            <div className={styles.fullWidth}>
                <strong>3. Auto Loans</strong>
            </div>
            <div className={styles.group}>
                <input name="borrow_prod3_title" defaultValue={settings.borrow_prod3_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <textarea name="borrow_prod3_desc" defaultValue={settings.borrow_prod3_desc} className={styles.textarea} />
            </div>
            {/* Prod 4 */}
            <div className={styles.fullWidth}>
                <strong>4. Student Loans</strong>
            </div>
            <div className={styles.group}>
                <input name="borrow_prod4_title" defaultValue={settings.borrow_prod4_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <textarea name="borrow_prod4_desc" defaultValue={settings.borrow_prod4_desc} className={styles.textarea} />
            </div>
            {/* Prod 5 */}
            <div className={styles.fullWidth}>
                <strong>5. Credit Cards</strong>
            </div>
            <div className={styles.group}>
                <input name="borrow_prod5_title" defaultValue={settings.borrow_prod5_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <textarea name="borrow_prod5_desc" defaultValue={settings.borrow_prod5_desc} className={styles.textarea} />
            </div>
            {/* Prod 6 */}
            <div className={styles.fullWidth}>
                <strong>6. Home Equity</strong>
            </div>
            <div className={styles.group}>
                <input name="borrow_prod6_title" defaultValue={settings.borrow_prod6_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <textarea name="borrow_prod6_desc" defaultValue={settings.borrow_prod6_desc} className={styles.textarea} />
            </div>

            {/* --- TRUST SECTION CONFIG --- */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Trust Section</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Title 1</label>
                <input name="borrow_trust1_title" defaultValue={settings.borrow_trust1_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <textarea name="borrow_trust1_desc" defaultValue={settings.borrow_trust1_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Title 2</label>
                <input name="borrow_trust2_title" defaultValue={settings.borrow_trust2_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <textarea name="borrow_trust2_desc" defaultValue={settings.borrow_trust2_desc} className={styles.textarea} />
            </div>
        </div>
    );
}