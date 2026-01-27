import ImageUploader from "@/components/admin/media/ImageUploader";
import styles from "../settings.module.css";

interface LearnTabProps {
    settings: any;
    learnHeroUrl: string; setLearnHeroUrl: (url: string) => void;
    art1Url: string; setArt1Url: (url: string) => void;
    art2Url: string; setArt2Url: (url: string) => void;
    art3Url: string; setArt3Url: (url: string) => void;
}

export function LearnTab({
    settings,
    learnHeroUrl, setLearnHeroUrl,
    art1Url, setArt1Url,
    art2Url, setArt2Url,
    art3Url, setArt3Url
}: LearnTabProps) {
    return (
        <div className={styles.grid}>

            {/* --- HERO SECTION --- */}
            <div className={styles.fullWidth}><h3 className={styles.sectionTitle}>Learn: Hero</h3></div>
            <div className={styles.group}><label className={styles.label}>Headline</label><input name="learn_hero_title" defaultValue={settings.learn_hero_title} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Highlight</label><input name="learn_hero_highlight" defaultValue={settings.learn_hero_highlight} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><label className={styles.label}>Description</label><textarea name="learn_hero_desc" defaultValue={settings.learn_hero_desc} className={styles.textarea} /></div>

            <div className={styles.group}>
                <ImageUploader label="Hero Image" value={learnHeroUrl} onChange={setLearnHeroUrl} />
                <input type="hidden" name="learn_hero_img" value={learnHeroUrl} />
            </div>
            <div className={styles.group}><label className={styles.label}>Alt Text</label><input name="learn_hero_alt" defaultValue={settings.learn_hero_alt} className={styles.input} /></div>

            {/* --- PULSE WIDGET --- */}
            <div className={styles.fullWidth}><hr className={styles.divider} /><h3 className={styles.sectionTitle}>Wellness Pulse Widget</h3></div>
            <div className={styles.group}><label className={styles.label}>Title</label><input name="learn_pulse_title" defaultValue={settings.learn_pulse_title} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Subtitle</label><input name="learn_pulse_desc" defaultValue={settings.learn_pulse_desc} className={styles.input} /></div>

            {/* Questions */}
            <div className={styles.fullWidth}><strong>Questions</strong></div>
            <div className={styles.group}><input name="learn_pulse_q1" defaultValue={settings.learn_pulse_q1} className={styles.input} /></div>
            <div className={styles.group}><input name="learn_pulse_q2" defaultValue={settings.learn_pulse_q2} className={styles.input} /></div>
            <div className={styles.group}><input name="learn_pulse_q3" defaultValue={settings.learn_pulse_q3} className={styles.input} /></div>

            {/* Results */}
            <div className={styles.fullWidth}><strong>Result: High Score</strong></div>
            <div className={styles.group}><input name="learn_pulse_res_high" defaultValue={settings.learn_pulse_res_high} className={styles.input} /></div>
            <div className={styles.group}><input name="learn_pulse_res_high_msg" defaultValue={settings.learn_pulse_res_high_msg} className={styles.input} /></div>
            <div className={styles.fullWidth}><strong>Result: Mid Score</strong></div>
            <div className={styles.group}><input name="learn_pulse_res_mid" defaultValue={settings.learn_pulse_res_mid} className={styles.input} /></div>
            <div className={styles.group}><input name="learn_pulse_res_mid_msg" defaultValue={settings.learn_pulse_res_mid_msg} className={styles.input} /></div>
            <div className={styles.fullWidth}><strong>Result: Low Score</strong></div>
            <div className={styles.group}><input name="learn_pulse_res_low" defaultValue={settings.learn_pulse_res_low} className={styles.input} /></div>
            <div className={styles.group}><input name="learn_pulse_res_low_msg" defaultValue={settings.learn_pulse_res_low_msg} className={styles.input} /></div>

            <div className={styles.group}><label className={styles.label}>Button Text</label><input name="learn_pulse_btn" defaultValue={settings.learn_pulse_btn} className={styles.input} /></div>

            {/* --- FEATURED ARTICLES --- */}
            <div className={styles.fullWidth}><hr className={styles.divider} /><h3 className={styles.sectionTitle}>Featured Articles</h3></div>
            <div className={styles.group}><label className={styles.label}>Section Title</label><input name="learn_insights_title" defaultValue={settings.learn_insights_title} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><label className={styles.label}>Description</label><textarea name="learn_insights_desc" defaultValue={settings.learn_insights_desc} className={styles.textarea} /></div>

            {/* Article 1 */}
            <div className={styles.fullWidth}><strong>Article 1 (Large)</strong></div>
            <div className={styles.group}><label className={styles.label}>Tag</label><input name="learn_art1_tag" defaultValue={settings.learn_art1_tag} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Title</label><input name="learn_art1_title" defaultValue={settings.learn_art1_title} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><textarea name="learn_art1_desc" defaultValue={settings.learn_art1_desc} className={styles.textarea} /></div>
            <div className={styles.group}><ImageUploader label="Image" value={art1Url} onChange={setArt1Url} /><input type="hidden" name="learn_art1_img" value={art1Url} /></div>
            <div className={styles.group}><label className={styles.label}>Link Text</label><input name="learn_art1_link" defaultValue={settings.learn_art1_link} className={styles.input} /></div>

            {/* Article 2 */}
            <div className={styles.fullWidth}><strong>Article 2</strong></div>
            <div className={styles.group}><label className={styles.label}>Tag</label><input name="learn_art2_tag" defaultValue={settings.learn_art2_tag} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Title</label><input name="learn_art2_title" defaultValue={settings.learn_art2_title} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><textarea name="learn_art2_desc" defaultValue={settings.learn_art2_desc} className={styles.textarea} /></div>
            <div className={styles.group}><ImageUploader label="Image" value={art2Url} onChange={setArt2Url} /><input type="hidden" name="learn_art2_img" value={art2Url} /></div>
            <div className={styles.group}><label className={styles.label}>Link Text</label><input name="learn_art2_link" defaultValue={settings.learn_art2_link} className={styles.input} /></div>

            {/* Article 3 */}
            <div className={styles.fullWidth}><strong>Article 3</strong></div>
            <div className={styles.group}><label className={styles.label}>Tag</label><input name="learn_art3_tag" defaultValue={settings.learn_art3_tag} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Title</label><input name="learn_art3_title" defaultValue={settings.learn_art3_title} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><textarea name="learn_art3_desc" defaultValue={settings.learn_art3_desc} className={styles.textarea} /></div>
            <div className={styles.group}><ImageUploader label="Image" value={art3Url} onChange={setArt3Url} /><input type="hidden" name="learn_art3_img" value={art3Url} /></div>
            <div className={styles.group}><label className={styles.label}>Link Text</label><input name="learn_art3_link" defaultValue={settings.learn_art3_link} className={styles.input} /></div>

            {/* --- CATEGORY STRIP --- */}
            <div className={styles.fullWidth}><hr className={styles.divider} /><h3 className={styles.sectionTitle}>Category Strip (Bottom)</h3></div>

            <div className={styles.fullWidth}><strong>1. Finance 101</strong></div>
            <div className={styles.group}><input name="learn_cat1_title" defaultValue={settings.learn_cat1_title} className={styles.input} /></div>
            <div className={styles.group}><input name="learn_cat1_desc" defaultValue={settings.learn_cat1_desc} className={styles.input} /></div>

            <div className={styles.fullWidth}><strong>2. Market News</strong></div>
            <div className={styles.group}><input name="learn_cat2_title" defaultValue={settings.learn_cat2_title} className={styles.input} /></div>
            <div className={styles.group}><input name="learn_cat2_desc" defaultValue={settings.learn_cat2_desc} className={styles.input} /></div>

            <div className={styles.fullWidth}><strong>3. Life Hacks</strong></div>
            <div className={styles.group}><input name="learn_cat3_title" defaultValue={settings.learn_cat3_title} className={styles.input} /></div>
            <div className={styles.group}><input name="learn_cat3_desc" defaultValue={settings.learn_cat3_desc} className={styles.input} /></div>

            <div className={styles.fullWidth}><strong>4. Webinars</strong></div>
            <div className={styles.group}><input name="learn_cat4_title" defaultValue={settings.learn_cat4_title} className={styles.input} /></div>
            <div className={styles.group}><input name="learn_cat4_desc" defaultValue={settings.learn_cat4_desc} className={styles.input} /></div>

        </div>
    );
}