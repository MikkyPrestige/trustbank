import ImageUploader from "@/components/admin/media/ImageUploader";
import styles from "../settings.module.css";

interface AboutTabProps {
    settings: any;
    aboutHeroUrl: string;
    setAboutHeroUrl: (url: string) => void;
}

export function AboutTab({ settings, aboutHeroUrl, setAboutHeroUrl }: AboutTabProps) {
    return (
        <div className={styles.grid}>
            {/* --- HERO --- */}
            <div className={styles.fullWidth}>
                <h3 className={styles.sectionTitle}>About: Hero</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Headline</label>
                <input name="about_hero_title" defaultValue={settings.about_hero_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="about_hero_desc" defaultValue={settings.about_hero_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Hero Background Image" value={aboutHeroUrl} onChange={setAboutHeroUrl} />
                <input type="hidden" name="about_hero_img" value={aboutHeroUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <input name="about_hero_alt" defaultValue={settings.about_hero_alt} className={styles.input} />
            </div>

            {/* --- STATS --- */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Key Statistics</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Active Users</label>
                <input name="about_stat_users" defaultValue={settings.about_stat_users} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Active Users Text</label>
                <input name="about_stat_users_text" defaultValue={settings.about_stat_users_text} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Assets Protected</label>
                <input name="about_stat_assets" defaultValue={settings.about_stat_assets} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Assets Protected Text</label>
                <input name="about_stat_assets_text" defaultValue={settings.about_stat_assets_text} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Countries</label>
                <input name="about_stat_countries" defaultValue={settings.about_stat_countries} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Countries Text</label>
                <input name="about_stat_countries_text" defaultValue={settings.about_stat_countries_text} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Support Hours</label>
                <input name="about_stat_support" defaultValue={settings.about_stat_support} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Support Hours Text</label>
                <input name="about_stat_support_text" defaultValue={settings.about_stat_support_text} className={styles.input} />
            </div>

            {/* --- MISSION --- */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Mission Cards</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Mission Title</label>
                <input name="about_mission_title" defaultValue={settings.about_mission_title} className={styles.input} />
            </div>
            {/* Card 1 */}
            <div className={styles.fullWidth}><strong>1. Security</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="about_mission1_title" defaultValue={settings.about_mission1_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="about_mission1_desc" defaultValue={settings.about_mission1_desc} className={styles.textarea} />
            </div>
            {/* Card 2 */}
            <div className={styles.fullWidth}><strong>2. Global</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="about_mission2_title" defaultValue={settings.about_mission2_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="about_mission2_desc" defaultValue={settings.about_mission2_desc} className={styles.textarea} />
            </div>
            {/* Card 3 */}
            <div className={styles.fullWidth}><strong>3. People</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="about_mission3_title" defaultValue={settings.about_mission3_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="about_mission3_desc" defaultValue={settings.about_mission3_desc} className={styles.textarea} />
            </div>

        </div>
    );
}