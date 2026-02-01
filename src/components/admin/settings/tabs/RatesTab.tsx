import ImageUploader from "@/components/admin/media/ImageUploader";
import styles from "../settings.module.css";

interface RatesTabProps {
    settings: any;
    RatesHeroURL: string;
    setRatesHeroURL: (url: string) => void;
}

export function RatesTab({ settings, RatesHeroURL, setRatesHeroURL }: RatesTabProps) {
    return (
        <div className={styles.grid}>

            <div className={styles.fullWidth}>
                <h3 className={styles.sectionTitle}>Rates Page Configuration</h3>
                <p className={styles.sectionSubtitle}>Manage all text, headers, and rate values on the Rates page.</p>
            </div>

            {/* HERO SECTION */}
            <div className={styles.group}>
                <label className={styles.label}>Hero Title</label>
                <input name="rates_hero_title" defaultValue={settings.rates_hero_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Hero Highlight</label>
                <input name="rates_hero_highlight" defaultValue={settings.rates_hero_highlight} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Hero Description</label>
                <textarea name="rates_hero_desc" defaultValue={settings.rates_hero_desc} className={styles.textarea} />
            </div>

            <div className={styles.fullWidth}>
                <h4 className={styles.sectionSubtitle} style={{ marginTop: '1rem' }}>Background Image</h4>
            </div>

            {/* IMAGE CONFIGURATION */}
            <div className={styles.group}>
                <label className={styles.label}>Image URL</label>
                <ImageUploader
                    label="rates_hero_img"
                    value={RatesHeroURL}
                    onChange={setRatesHeroURL}
                />
                <input type="hidden" name="rates_hero_img" value={settings.rates_hero_img} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <input
                    name="rates_hero_alt"
                    defaultValue={settings.rates_hero_alt}
                    className={styles.input}
                    placeholder="e.g. Graph showing rising interest rates"
                />
            </div>

            {/* --- DEPOSIT SECTION CONFIG --- */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Deposit Section Layout</h3>
            </div>
            <div className={styles.group}><label className={styles.label}>Section Title</label><input name="rates_title_deposit" defaultValue={settings.rates_title_deposit} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>&quot;Popular&quot; Tag Text</label><input name="rates_tag_popular" defaultValue={settings.rates_tag_popular} className={styles.input} /></div>

            {/* Deposit Table Headers */}
            <div className={styles.group}><label className={styles.label}>Col 1 Header</label><input name="rates_dep_head_prod" defaultValue={settings.rates_dep_head_prod} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Col 2 Header</label><input name="rates_dep_head_rate" defaultValue={settings.rates_dep_head_rate} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Col 3 Header</label><input name="rates_dep_head_apy" defaultValue={settings.rates_dep_head_apy} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Col 4 Header</label><input name="rates_dep_head_min" defaultValue={settings.rates_dep_head_min} className={styles.input} /></div>

            {/* --- DEPOSIT PRODUCTS --- */}
            <div className={styles.fullWidth}>
                <h3 className={styles.sectionTitle}>Deposit Products</h3>
            </div>
            {/* HYSA */}
            <div className={styles.group}><label className={styles.label}>Product 1 Name</label><input name="rate_hysa_name" defaultValue={settings.rate_hysa_name} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Rate %</label><input name="rate_hysa_rate" defaultValue={settings.rate_hysa_rate} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>APY %</label><input name="rate_hysa_apy" defaultValue={settings.rate_hysa_apy} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Min Balance</label><input name="rate_hysa_min" defaultValue={settings.rate_hysa_min} className={styles.input} /></div>

            {/* MMA */}
            <div className={styles.group}><label className={styles.label}>Product 2 Name</label><input name="rate_mma_name" defaultValue={settings.rate_mma_name} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Rate %</label><input name="rate_mma_rate" defaultValue={settings.rate_mma_rate} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>APY %</label><input name="rate_mma_apy" defaultValue={settings.rate_mma_apy} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Min Balance</label><input name="rate_mma_min" defaultValue={settings.rate_mma_min} className={styles.input} /></div>

            {/* CD */}
            <div className={styles.group}><label className={styles.label}>Product 3 Name</label><input name="rate_cd_name" defaultValue={settings.rate_cd_name} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Rate %</label><input name="rate_cd_rate" defaultValue={settings.rate_cd_rate} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>APY %</label><input name="rate_cd_apy" defaultValue={settings.rate_cd_apy} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Min Balance</label><input name="rate_cd_min" defaultValue={settings.rate_cd_min} className={styles.input} /></div>

            {/* KIDS CLUB */}
            <div className={styles.group}><label className={styles.label}>Product 4 Name</label><input name="rate_kids_name" defaultValue={settings.rate_kids_name} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Rate %</label><input name="rate_kids_rate" defaultValue={settings.rate_kids_rate} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>APY %</label><input name="rate_kids_apy" defaultValue={settings.rate_kids_apy} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Min Balance</label><input name="rate_kids_min" defaultValue={settings.rate_kids_min} className={styles.input} /></div>

            {/* --- BORROW SECTION CONFIG --- */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Borrow Section Layout</h3>
            </div>
            <div className={styles.group}><label className={styles.label}>Section Title</label><input name="rates_title_borrow" defaultValue={settings.rates_title_borrow} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>&quot;View&quot; Button Text</label><input name="rates_btn_view" defaultValue={settings.rates_btn_view} className={styles.input} /></div>

            {/* Borrow Table Headers */}
            <div className={styles.group}><label className={styles.label}>Col 1 Header</label><input name="rates_loan_head_type" defaultValue={settings.rates_loan_head_type} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Col 2 Header</label><input name="rates_loan_head_term" defaultValue={settings.rates_loan_head_term} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Col 3 Header</label><input name="rates_loan_head_apr" defaultValue={settings.rates_loan_head_apr} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Col 4 Header</label><input name="rates_loan_head_detail" defaultValue={settings.rates_loan_head_detail} className={styles.input} /></div>

            {/* --- BORROW PRODUCTS --- */}
            <div className={styles.fullWidth}>
                <h3 className={styles.sectionTitle}>Loan Products</h3>
            </div>
            {/* Auto */}
            <div className={styles.group}><label className={styles.label}>Loan 1 Name</label><input name="rate_auto_name" defaultValue={settings.rate_auto_name} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Term</label><input name="rate_auto_term" defaultValue={settings.rate_auto_term} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>APR %</label><input name="rate_auto_apr" defaultValue={settings.rate_auto_apr} className={styles.input} /></div>

            {/* Personal */}
            <div className={styles.group}><label className={styles.label}>Loan 2 Name</label><input name="rate_personal_name" defaultValue={settings.rate_personal_name} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Term</label><input name="rate_personal_term" defaultValue={settings.rate_personal_term} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>APR %</label><input name="rate_personal_apr" defaultValue={settings.rate_personal_apr} className={styles.input} /></div>

            {/* Mortgage */}
            <div className={styles.group}><label className={styles.label}>Loan 3 Name</label><input name="rate_mortgage_name" defaultValue={settings.rate_mortgage_name} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Term</label><input name="rate_mortgage_term" defaultValue={settings.rate_mortgage_term} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>APR %</label><input name="rate_mortgage_30yr" defaultValue={settings.rate_mortgage_30yr} className={styles.input} /></div>

            {/* CREDIT CARD */}
            <div className={styles.group}><label className={styles.label}>Loan 4 Name</label><input name="rate_cc_name" defaultValue={settings.rate_cc_name} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Term</label><input name="rate_cc_term" defaultValue={settings.rate_cc_term} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Intro APR</label><input name="rate_cc_intro" defaultValue={settings.rate_cc_intro} className={styles.input} /></div>

            {/* --- DISCLAIMER --- */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Footer Disclaimer</h3>
            </div>
            <div className={styles.group}><label className={styles.label}>Disclaimer Title</label><input name="rates_disclaimer_title" defaultValue={settings.rates_disclaimer_title} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Disclaimer Text</label>
                <textarea name="rates_disclaimer" defaultValue={settings.rates_disclaimer} className={styles.textarea} style={{ minHeight: '100px' }} />
            </div>
        </div>
    );
}