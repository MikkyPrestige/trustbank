import ImageUploader from "@/components/admin/media/ImageUploader";
import styles from "../settings.module.css";

interface InsureTabProps {
    settings: any;
    insureHeroUrl: string; setInsureHeroUrl: (url: string) => void;
    partner1: string; setPartner1: (url: string) => void;
    partner2: string; setPartner2: (url: string) => void;
    partner3: string; setPartner3: (url: string) => void;
    partner4: string; setPartner4: (url: string) => void;
    insureP1Url: string; setInsureP1Url: (url: string) => void;
    insureP2Url: string; setInsureP2Url: (url: string) => void;
    insureP3Url: string; setInsureP3Url: (url: string) => void;
    insureP4Url: string; setInsureP4Url: (url: string) => void;
}

export function InsureTab({ settings, insureHeroUrl, setInsureHeroUrl, partner1, setPartner1, partner2, setPartner2, partner3, setPartner3, partner4, setPartner4, insureP1Url, setInsureP1Url, insureP2Url, setInsureP2Url, insureP3Url, setInsureP3Url, insureP4Url, setInsureP4Url }: InsureTabProps) {
    return (
        <div className={styles.grid}>
            {/* --- HERO SECTION --- */}
            <div className={styles.fullWidth}>
                <h3 className={styles.sectionTitle}>Insure: Hero</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Badge</label>
                <input name="insure_hero_badge " defaultValue={settings.insure_hero_badge} className={styles.input} />
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Headline</label>
                    <input name="insure_hero_title" defaultValue={settings.insure_hero_title} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Highlight</label>
                    <input name="insure_hero_highlight" defaultValue={settings.insure_hero_highlight} className={styles.input} />
                </div>
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="insure_hero_desc" defaultValue={settings.insure_hero_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Hero Background Image" value={insureHeroUrl} onChange={setInsureHeroUrl} />
                <input type="hidden" name="insure_hero_img" value={insureHeroUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <input name="insure_hero_alt" defaultValue={settings.insure_hero_alt} className={styles.input} />
            </div>

            {/* --- WIZARD LABELS --- */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Coverage Wizard Settings</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="insure_wiz_title" defaultValue={settings.insure_wiz_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Match Badge Text</label>
                <input name="insure_wiz_match" defaultValue={settings.insure_wiz_match} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="insure_wiz_desc" defaultValue={settings.insure_wiz_desc} className={styles.textarea} />
            </div>
            {/* Questions */}
            <div className={styles.fullWidth}><strong>Questions</strong></div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Question 1</label>
                <input name="insure_wiz_step1" defaultValue={settings.insure_wiz_step1} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Option 1</label>
                <input name="insure_wiz_step1_option1" defaultValue={settings.insure_wiz_step1_option1} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Value 1</label>
                <input name="insure_wiz_step1_option1Val" defaultValue={settings.insure_wiz_step1_option1Val} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Option 2</label>
                <input name="insure_wiz_step1_option2" defaultValue={settings.insure_wiz_step1_option2} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Value 2</label>
                <input name="insure_wiz_step1_option2Val" defaultValue={settings.insure_wiz_step1_option2Val} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Option 3</label>
                <input name="insure_wiz_step1_option3" defaultValue={settings.insure_wiz_step1_option3} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Value 3</label>
                <input name="insure_wiz_step1_option3Val" defaultValue={settings.insure_wiz_step1_option3Val} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Question 2</label>
                <input name="insure_wiz_step2" defaultValue={settings.insure_wiz_step2} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Option 1</label>
                <input name="insure_wiz_step2_option1" defaultValue={settings.insure_wiz_step2_option1} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Value 1</label>
                <input name="insure_wiz_step2_option1Val" defaultValue={settings.insure_wiz_step2_option1Val} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Option 2</label>
                <input name="insure_wiz_step2_option1" defaultValue={settings.insure_wiz_step2_option1} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Value 2</label>
                <input name="insure_wiz_step2_option2Val" defaultValue={settings.insure_wiz_step2_option2Val} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Option 3</label>
                <input name="insure_wiz_step2_option1" defaultValue={settings.insure_wiz_step2_option1} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Value 3</label>
                <input name="insure_wiz_step2_option3Val" defaultValue={settings.insure_wiz_step2_option3Val} className={styles.input} />
            </div>
            {/* Buttons */}
            <div className={styles.group}>
                <label className={styles.label}>CTA Button Text</label>
                <input name="insure_wiz_btn_view" defaultValue={settings.insure_wiz_btn_view} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Reset Button Text</label>
                <input name="insure_wiz_btn_reset" defaultValue={settings.insure_wiz_btn_reset} className={styles.input} />
            </div>

            {/* --- PRODUCTS (ANCHORS) --- */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Anchor Sections</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="insure_products_title" defaultValue={settings.insure_products_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="insure_products_desc" defaultValue={settings.insure_products_desc} className={styles.textarea} />
            </div>
            {/* 1. Medicare */}
            <div className={styles.fullWidth}><strong>1. Medicare</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="insure_prod1_title" defaultValue={settings.insure_prod1_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Anchor ID</label>
                <input name="insure_prod1_id" defaultValue={settings.insure_prod1_id} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="insure_prod1_desc" defaultValue={settings.insure_prod1_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Text</label>
                <input name="insure_prod1_btn" defaultValue={settings.insure_prod1_btn} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Anchor Link</label>
                <input name="insure_prod1_link" defaultValue={settings.insure_prod1_link} className={styles.input} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Section Image" value={insureP1Url} onChange={setInsureP1Url} />
                <input type="hidden" name="insure_prod1_img" value={insureP1Url} /></div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <input name="insure_prod1_img_alt" defaultValue={settings.insure_prod1_img_alt} className={styles.input} placeholder="Alt Text" />
            </div>
            {/* 2. Auto */}
            <div className={styles.fullWidth}><strong>2. Auto</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="insure_prod2_title" defaultValue={settings.insure_prod2_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Anchor ID</label>
                <input name="insure_prod2_id" defaultValue={settings.insure_prod2_id} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="insure_prod2_desc" defaultValue={settings.insure_prod2_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Text</label>
                <input name="insure_prod2_btn" defaultValue={settings.insure_prod2_btn} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Anchor Link</label>
                <input name="insure_prod2_link" defaultValue={settings.insure_prod2_link} className={styles.input} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Section Image" value={insureP2Url} onChange={setInsureP2Url} />
                <input type="hidden" name="insure_prod2_img" value={insureP2Url} /></div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <input name="insure_prod2_img_alt" defaultValue={settings.insure_prod2_img_alt} className={styles.input} placeholder="Alt Text" />
            </div>
            {/* 3. Home  */}
            <div className={styles.fullWidth}><strong>3. Home</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="insure_prod3_title" defaultValue={settings.insure_prod3_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Anchor ID</label>
                <input name="insure_prod3_id" defaultValue={settings.insure_prod3_id} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="insure_prod3_desc" defaultValue={settings.insure_prod3_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Text</label>
                <input name="insure_prod3_btn" defaultValue={settings.insure_prod3_btn} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Anchor Link</label>
                <input name="insure_prod3_link" defaultValue={settings.insure_prod3_link} className={styles.input} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Section Image" value={insureP3Url} onChange={setInsureP3Url} />
                <input type="hidden" name="insure_prod3_img" value={insureP3Url} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <input name="insure_prod3_img_alt" defaultValue={settings.insure_prod3_img_alt} className={styles.input} placeholder="Alt Text" />
            </div>
            {/* 4. Life */}
            <div className={styles.fullWidth}><strong>4. Life</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="insure_prod4_title" defaultValue={settings.insure_prod4_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Anchor ID</label>
                <input name="insure_prod4_id" defaultValue={settings.insure_prod4_id} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="insure_prod4_desc" defaultValue={settings.insure_prod4_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Text</label>
                <input name="insure_prod4_btn" defaultValue={settings.insure_prod4_btn} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Anchor Link</label>
                <input name="insure_prod4_link" defaultValue={settings.insure_prod4_link} className={styles.input} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Section Image" value={insureP4Url} onChange={setInsureP4Url} />
                <input type="hidden" name="insure_prod4_img" value={insureP4Url} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <input name="insure_prod4_img_alt" defaultValue={settings.insure_prod4_img_alt} className={styles.input} placeholder="Alt Text" />
            </div>

            {/* --- SUPPLEMENTAL GRID --- */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Supplemental Grid</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Grid Title</label>
                <input name="insure_supp_title" defaultValue={settings.insure_supp_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Grid Link Text</label>
                <input name="insure_supp_link_text" defaultValue={settings.insure_supp_link_text} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Grid Description</label>
                <textarea name="insure_supp_desc" defaultValue={settings.insure_supp_desc} className={styles.input} />
            </div>
            {/* 5. Accident */}
            <div className={styles.fullWidth}><strong>5. Accident</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="insure_prod5_title" defaultValue={settings.insure_prod5_title} className={styles.input} />
            </div>
              <div className={styles.group}>
                <label className={styles.label}>Anchor ID</label>
                <input name="insure_prod5_id" defaultValue={settings.insure_prod5_id} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Anchor Link</label>
                <input name="insure_prod5_link" defaultValue={settings.insure_prod5_link} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="insure_prod5_desc" defaultValue={settings.insure_prod5_desc} className={styles.textarea} />
            </div>
            {/* 6. Business */}
            <div className={styles.fullWidth}><strong>6. Business</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="insure_prod6_title" defaultValue={settings.insure_prod6_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Anchor ID</label>
                <input name="insure_prod6_id" defaultValue={settings.insure_prod6_id} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Anchor Link</label>
                <input name="insure_prod6_link" defaultValue={settings.insure_prod6_link} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="insure_prod6_desc" defaultValue={settings.insure_prod6_desc} className={styles.textarea} />
            </div>

            {/* --- PARTNERS --- */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Partner Logos</h3>
            </div>
            <div className={styles.fullWidth}>
                <label className={styles.label}>Title</label>
                <input name="insure_partners_title" defaultValue={settings.insure_partners_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Logo 1" value={partner1} onChange={setPartner1} />
                <input type="hidden" name="insure_partner1_img" value={partner1} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <input name="insure_partner1_img_alt" defaultValue={settings.insure_partner1_img_alt} className={styles.input} placeholder="Alt Text" />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Logo 2" value={partner2} onChange={setPartner2} />
                <input type="hidden" name="insure_partner2_img" value={partner2} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <input name="insure_partner2_img_alt" defaultValue={settings.insure_partner2_img_alt} className={styles.input} placeholder="Alt Text" />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Logo 3" value={partner3} onChange={setPartner3} />
                <input type="hidden" name="insure_partner3_img" value={partner3} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <input name="insure_partner3_img_alt" defaultValue={settings.insure_partner3_img_alt} className={styles.input} placeholder="Alt Text" />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Logo 4" value={partner4} onChange={setPartner4} />
                <input type="hidden" name="insure_partner4_img" value={partner4} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <input name="insure_partner4_img_alt" defaultValue={settings.insure_partner4_img_alt} className={styles.input} placeholder="Alt Text" />
            </div>
        </div>
    );
}