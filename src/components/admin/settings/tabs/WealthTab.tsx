import ImageUploader from "@/components/admin/media/ImageUploader";
import styles from "../settings.module.css";

interface WealthTabProps {
    settings: any;
    wealthHeroUrl: string; setWealthHeroUrl: (url: string) => void;
    wealthPcgUrl: string; setWealthPcgUrl: (url: string) => void;
    wealthRetUrl: string; setWealthRetUrl: (url: string) => void;
    wealthEstUrl: string; setWealthEstUrl: (url: string) => void;
}

export function WealthTab({ settings, wealthHeroUrl, setWealthHeroUrl, wealthPcgUrl, setWealthPcgUrl, wealthRetUrl, setWealthRetUrl, wealthEstUrl, setWealthEstUrl }: WealthTabProps) {
    return (
        <div className={styles.grid}>

            {/* --- HERO SECTION --- */}
            <div className={styles.fullWidth}>
                <h3 className={styles.sectionTitle}>Wealth: Hero</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Headline</label>
                <input name="wealth_hero_title" defaultValue={settings.wealth_hero_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Highlight (Gold)</label>
                <input name="wealth_hero_highlight" defaultValue={settings.wealth_hero_highlight} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Badge Text</label>
                <input name="wealth_hero_badge" defaultValue={settings.wealth_hero_badge} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="wealth_hero_desc" defaultValue={settings.wealth_hero_desc} className={styles.textarea} />
            </div>

            <div className={styles.group}>
                <ImageUploader label="Hero Image" value={wealthHeroUrl} onChange={setWealthHeroUrl} />
                <input type="hidden" name="wealth_hero_img" value={wealthHeroUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Alt Text</label>
                <input name="wealth_hero_alt" defaultValue={settings.wealth_hero_alt} className={styles.input} />
            </div>

            {/* --- SIMULATOR LABELS --- */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Simulator Labels</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Sim Title</label>
                <input name="wealth_sim_title" defaultValue={settings.wealth_sim_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Sim Desc</label>
                <input name="wealth_sim_desc" defaultValue={settings.wealth_sim_desc} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>&quot;Volatility&quot; Label</label>
                <input name="wealth_sim_label_volatility" defaultValue={settings.wealth_sim_label_volatility} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>&quot;Allocation&quot; Label</label>
                <input name="wealth_sim_label_allocation" defaultValue={settings.wealth_sim_label_allocation} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Risk Label</label>
                <input name="wealth_sim_risk_label" defaultValue={settings.wealth_sim_risk_label} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Return Label</label>
                <input name="wealth_sim_return_label" defaultValue={settings.wealth_sim_return_label} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Disclaimer Note</label>
                <input name="wealth_sim_note" defaultValue={settings.wealth_sim_note} className={styles.input} />
            </div>

            <div className={styles.fullWidth}>
                <strong>Legend Items</strong>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Stocks</label>
                <input name="wealth_sim_legend_stocks" defaultValue={settings.wealth_sim_legend_stocks} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Crypto</label>
                <input name="wealth_sim_legend_crypto" defaultValue={settings.wealth_sim_legend_crypto} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Real Estate</label>
                <input name="wealth_sim_legend_real" defaultValue={settings.wealth_sim_legend_real} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Bonds</label>
                <input name="wealth_sim_legend_bonds" defaultValue={settings.wealth_sim_legend_bonds} className={styles.input} />
            </div>

            {/* --- ANCHOR SECTIONS --- */}
            <div className={styles.fullWidth}><hr className={styles.divider} /><h3 className={styles.sectionTitle}>Wealth Sections</h3></div>
            {/* 1. Private Client (#pcg) */}
            <div className={styles.fullWidth}><h4 className={styles.subsectionTitle}>1. Private Client (#pcg)</h4></div>
            <div className={styles.group}><input name="wealth_pcg_title" defaultValue={settings.wealth_pcg_title} className={styles.input} /></div>
            <div className={styles.group}><input name="wealth_pcg_btn" defaultValue={settings.wealth_pcg_btn} className={styles.input} /></div>
            <div className={styles.group}><ImageUploader label="Image" value={wealthPcgUrl} onChange={setWealthPcgUrl} /><input type="hidden" name="wealth_pcg_img" value={wealthPcgUrl} /></div>
            <div className={styles.group}><label className={styles.label}>Alt</label><input name="wealth_pcg_img_alt" defaultValue={settings.wealth_pcg_img_alt} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><textarea name="wealth_pcg_desc" defaultValue={settings.wealth_pcg_desc} className={styles.textarea} /></div>
            {/* 2. Retirement (#retirement) */}
            <div className={styles.fullWidth}><h4 className={styles.subsectionTitle}>2. Retirement (#retirement)</h4></div>
            <div className={styles.group}><input name="wealth_ret_title" defaultValue={settings.wealth_ret_title} className={styles.input} /></div>
            <div className={styles.group}><input name="wealth_ret_btn" defaultValue={settings.wealth_ret_btn} className={styles.input} /></div>
            <div className={styles.group}><ImageUploader label="Image" value={wealthRetUrl} onChange={setWealthRetUrl} /><input type="hidden" name="wealth_ret_img" value={wealthRetUrl} /></div>
            <div className={styles.group}><label className={styles.label}>Alt</label><input name="wealth_ret_img_alt" defaultValue={settings.wealth_ret_img_alt} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><textarea name="wealth_ret_desc" defaultValue={settings.wealth_ret_desc} className={styles.textarea} /></div>
            {/* 3. Estate (#estate) */}
            <div className={styles.fullWidth}><h4 className={styles.subsectionTitle}>3. Estate (#estate)</h4></div>
            <div className={styles.group}><input name="wealth_est_title" defaultValue={settings.wealth_est_title} className={styles.input} /></div>
            <div className={styles.group}><input name="wealth_est_btn" defaultValue={settings.wealth_est_btn} className={styles.input} /></div>
            <div className={styles.group}><ImageUploader label="Image" value={wealthEstUrl} onChange={setWealthEstUrl} /><input type="hidden" name="wealth_est_img" value={wealthEstUrl} /></div>
            <div className={styles.group}><label className={styles.label}>Alt</label><input name="wealth_est_img_alt" defaultValue={settings.wealth_est_img_alt} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><textarea name="wealth_est_desc" defaultValue={settings.wealth_est_desc} className={styles.textarea} /></div>
            {/* --- ADVISOR  --- */}
            <div className={styles.fullWidth}><hr className={styles.divider} /><h3 className={styles.sectionTitle}>Advisor</h3></div>
            <div className={styles.group}><label className={styles.label}>Title</label><input name="wealth_advisor_title" defaultValue={settings.wealth_advisor_title} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><label className={styles.label}>Description</label><textarea name="wealth_advisor_desc" defaultValue={settings.wealth_advisor_desc} className={styles.textarea} /></div>
            <div className={styles.fullWidth}><strong>Checklist Items</strong></div>
            <div className={styles.group}><input name="wealth_adv_item1" defaultValue={settings.wealth_adv_item1} className={styles.input} /></div>
            <div className={styles.group}><input name="wealth_adv_item2" defaultValue={settings.wealth_adv_item2} className={styles.input} /></div>
            <div className={styles.group}><input name="wealth_adv_item3" defaultValue={settings.wealth_adv_item3} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Button Text</label><input name="wealth_adv_btn" defaultValue={settings.wealth_adv_btn} className={styles.input} /></div>

            {/* --- SERVICES --- */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Wealth Services</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Section Title</label>
                <input name="wealth_grid_title" defaultValue={settings.wealth_grid_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Section Subtitle</label>
                <input name="wealth_grid_desc" defaultValue={settings.wealth_grid_desc} className={styles.input} />
            </div>
            <div className={styles.fullWidth}><strong>1. Investment Advisory</strong></div>
            <div className={styles.group}><input name="wealth_service1_title" defaultValue={settings.wealth_service1_title} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Button Text</label><input name="wealth_service1_btn" defaultValue={settings.wealth_service1_btn} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><textarea name="wealth_service1_desc" defaultValue={settings.wealth_service1_desc} className={styles.textarea} /></div>
            {/* Service 2 */}
            <div className={styles.fullWidth}><strong>2. Estate & Trust</strong></div>
            <div className={styles.group}><input name="wealth_service2_title" defaultValue={settings.wealth_service2_title} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Button Text</label><input name="wealth_service2_btn" defaultValue={settings.wealth_service2_btn} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><textarea name="wealth_service2_desc" defaultValue={settings.wealth_service2_desc} className={styles.textarea} /></div>
            {/* Service 3 */}
            <div className={styles.fullWidth}><strong>3. Retirement Planning</strong></div>
            <div className={styles.group}><input name="wealth_service3_title" defaultValue={settings.wealth_service3_title} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Button Text</label><input name="wealth_service3_btn" defaultValue={settings.wealth_service3_btn} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><textarea name="wealth_service3_desc" defaultValue={settings.wealth_service3_desc} className={styles.textarea} /></div>
        </div>
    );
}