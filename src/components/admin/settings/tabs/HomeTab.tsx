import ImageUploader from "@/components/admin/media/ImageUploader";
import styles from "../settings.module.css";

interface GeneralTabProps {
    settings: any;
    logoUrl: string; setLogoUrl: (url: string) => void;
    heroUrl: string; setHeroUrl: (url: string) => void;
    homeCardUrl: string; setHomeCardUrl: (url: string) => void;
    homeCtaUrl: string; setHomeCtaUrl: (url: string) => void;
    guide1Url: string; setGuide1Url: (u: string) => void;
    guide3Url: string; setGuide3Url: (u: string) => void;
    guide4Url: string; setGuide4Url: (u: string) => void;
    loan1Url: string; setLoan1Url: (u: string) => void;
    loan2Url: string; setLoan2Url: (u: string) => void;
    investUrl: string; setInvestUrl: (u: string) => void;
    globalMapUrl: string; setGlobalMapUrl: (u: string) => void;
    partner1: string; setPartner1: (u: string) => void;
    partner2: string; setPartner2: (u: string) => void;
    partner3: string; setPartner3: (u: string) => void;
    partner4: string; setPartner4: (u: string) => void;
    partner5: string; setPartner5: (u: string) => void;
    partner6: string; setPartner6: (u: string) => void;
}

export function HomeTab({ settings, logoUrl, setLogoUrl, heroUrl, setHeroUrl, homeCardUrl, setHomeCardUrl, homeCtaUrl, setHomeCtaUrl, guide1Url, setGuide1Url, guide3Url, setGuide3Url, guide4Url, setGuide4Url, loan1Url, setLoan1Url, loan2Url, setLoan2Url, investUrl, setInvestUrl, globalMapUrl, setGlobalMapUrl, partner1, setPartner1, partner2, setPartner2, partner3, setPartner3, partner4, setPartner4, partner5, setPartner5, partner6, setPartner6 }: GeneralTabProps) {
    return (
        <div className={styles.grid}>
            {/* 1. BRAND */}
            <div className={styles.fullWidth}>
                <h3 className={styles.sectionTitle}>Brand Identity</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Site Name</label>
                <input name="site_name" defaultValue={settings.site_name} className={styles.input} />
            </div>
            <div className={styles.groupHeader}></div>
            <div className={styles.group}>
                <ImageUploader
                    label="Site Logo"
                    value={logoUrl}
                    onChange={(url) => setLogoUrl(url)}
                />
                <input type="hidden" name="site_logo" value={logoUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Logo Alt</label>
                <textarea name="site_logo_alt" defaultValue={settings.site_logo_alt} className={styles.textarea} />
            </div>

            {/* 2. HERO SECTION */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Hero Section</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Hero Badge</label>
                <input name="hero_badge" defaultValue={settings.hero_badge} className={styles.input} placeholder="e.g. TRUST BANK PERSONAL" />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Headline</label>
                <input name="hero_title" defaultValue={settings.hero_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Subtitle</label>
                <textarea name="hero_subtitle" defaultValue={settings.hero_subtitle} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Hero Background Image" value={heroUrl} onChange={(url) => setHeroUrl(url)} />
                <input type="hidden" name="home_hero_img" value={heroUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <textarea name="home_hero_alt" defaultValue={settings.home_hero_alt} className={styles.textarea} />
            </div>
            <div className={styles.groupHeader}><strong>CTA</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Text</label>
                <input name="hero_cta_link" defaultValue={settings.hero_cta_link} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Link</label>
                <input name="hero_cta_text" defaultValue={settings.hero_cta_text} className={styles.input} />
            </div>
            <div className={styles.groupHeader}><strong>CTA 2</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Text</label>
                <input name="hero_cta1_text" defaultValue={settings.hero_cta1_text} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Link</label>
                <input name="hero_cta1_link" defaultValue={settings.hero_cta1_link} className={styles.input} />
            </div>

            {/* 3. INFO BAR */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Info Bar</h3>
            </div>
            <div className={`${styles.group} ${styles.toggleWrapper}`}>
                <input type="hidden" name="announcement_active" value="false" />
                <input
                    type="checkbox"
                    name="announcement_active"
                    value='true'
                    defaultChecked={settings.announcement_active}
                    className={styles.checkbox}
                />
                <label className={styles.toggleLabel}>Show Announcement Bar?</label>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Announcement Phone</label>
                <input name="announcement_contact_phone" defaultValue={settings.announcement_contact_phone} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Announcement Text</label>
                <textarea name="announcement_text" defaultValue={settings.announcement_text} className={styles.textarea} />
            </div>

            <div className={styles.groupHeader}><strong>Interface</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Support</label>
                <input name="home_support_label" defaultValue={settings.home_support_label} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Hours</label>
                <input name="home_hours_label" defaultValue={settings.home_hours_label} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Location Link Text</label>
                <input name="home_location_link_text" defaultValue={settings.home_location_link_text} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Location URL</label>
                <input name="home_location_link_url" defaultValue={settings.home_location_link_url} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Routing Label</label>
                <input name="home_routing_label" defaultValue={settings.home_routing_label} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Routing Number</label>
                <input name="routingNumber" defaultValue={settings.routingNumber} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>SWIFT Label</label>
                <input name="home_swift_label" defaultValue={settings.home_swift_label} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>SWIFT Code</label>
                <input name="swiftCode" defaultValue={settings.swiftCode} className={styles.input} />
            </div>

            {/* 4. RATES GRID */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Rates Grid</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Section Title</label>
                <input name="home_rates_title" defaultValue={settings.home_rates_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="home_rates_desc" defaultValue={settings.home_rates_desc} className={styles.textarea} />
            </div>
            <div className={styles.groupHeader}><strong>Tabs & Units</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Tab 1</label>
                <input name="home_rates_tab1_label" defaultValue={settings.home_rates_tab1_label} className={styles.input} placeholder="Save Tab" />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Tab 2</label>
                <input name="home_rates_tab2_label" defaultValue={settings.home_rates_tab2_label} className={styles.input} placeholder="Borrow Tab" />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Unit APY</label>
                <input name="home_rates_unit_apy" defaultValue={settings.home_rates_unit_apy} className={styles.input} placeholder="APY" />
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Unit APR</label>
                    <input name="home_rates_unit_apr" defaultValue={settings.home_rates_unit_apr} className={styles.input} placeholder="APR" />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Unit Bonus</label>
                    <input name="home_rates_unit_bonus" defaultValue={settings.home_rates_unit_bonus} className={styles.input} placeholder="BONUS" />
                </div>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Currency Symbol</label>
                <input name="home_rates_currency_symbol" defaultValue={settings.home_rates_currency_symbol} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Percent Symbol</label>
                <input name="home_rates_percent_symbol" defaultValue={settings.home_rates_percent_symbol} className={styles.input} />
            </div>

            <div className={styles.groupHeader}><strong>Card 1: Savings</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Badge</label>
                <input name="home_rates_c1_badge" defaultValue={settings.home_rates_c1_badge} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="home_rates_c1_title" defaultValue={settings.home_rates_c1_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Subtitle</label>
                <input name="home_rates_c1_sub" defaultValue={settings.home_rates_c1_sub} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Text</label>
                <input name="home_rates_c1_btn_text" defaultValue={settings.home_rates_c1_btn_text} className={styles.input} />
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Row 1 Label</label>
                    <input name="home_rates_c1_row1_label" defaultValue={settings.home_rates_c1_row1_label} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Row 1 Value</label>
                    <input name="home_rates_c1_row1_value" defaultValue={settings.home_rates_c1_row1_value} className={styles.input} />
                </div>
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Row 2 Label</label>
                    <input name="home_rates_c1_row2_label" defaultValue={settings.home_rates_c1_row2_label} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Row 2 Value</label>
                    <input name="home_rates_c1_row2_value" defaultValue={settings.home_rates_c1_row2_value} className={styles.input} />
                </div>
            </div>

            <div className={styles.groupHeader}><strong>Card 2: CD</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="home_rates_c2_title" defaultValue={settings.home_rates_c2_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Subtitle</label>
                <input name="home_rates_c2_sub" defaultValue={settings.home_rates_c2_sub} className={styles.input} />
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Row 1 Label</label>
                    <input name="home_rates_c2_row1_label" defaultValue={settings.home_rates_c2_row1_label} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Row 1 Value</label>
                    <input name="home_rates_c2_row1_value" defaultValue={settings.home_rates_c2_row1_value} className={styles.input} />
                </div>
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Row 2 Label</label>
                    <input name="home_rates_c2_row2_label" defaultValue={settings.home_rates_c2_row2_label} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Row 2 Value</label>
                    <input name="home_rates_c2_row2_value" defaultValue={settings.home_rates_c2_row2_value} className={styles.input} />
                </div>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Text</label>
                <input name="home_rates_c2_btn_text" defaultValue={settings.home_rates_c2_btn_text} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Link</label>
                <input name="home_rates_c2_btn_link" defaultValue={settings.home_rates_c2_btn_link} className={styles.input} />
            </div>

            <div className={styles.groupHeader}><strong>Card 3: Checking</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="home_rates_c3_title" defaultValue={settings.home_rates_c3_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Subtitle</label><input name="home_rates_c3_sub" defaultValue={settings.home_rates_c3_sub} className={styles.input} />
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Row 1 Label</label>
                    <input name="home_rates_c3_row1_label" defaultValue={settings.home_rates_c3_row1_label} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Row 1 Value</label>
                    <input name="home_rates_c3_row1_value" defaultValue={settings.home_rates_c3_row1_value} className={styles.input} />
                </div>
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Row 2 Label</label>
                    <input name="home_rates_c3_row2_label" defaultValue={settings.home_rates_c3_row2_label} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Row 2 Value</label>
                    <input name="home_rates_c3_row2_value" defaultValue={settings.home_rates_c3_row2_value} className={styles.input} />
                </div>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Text</label>
                <input name="home_rates_c3_btn_text" defaultValue={settings.home_rates_c3_btn_text} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Link</label>
                <input name="home_rates_c3_btn_link" defaultValue={settings.home_rates_c3_btn_link} className={styles.input} />
            </div>

            <div className={styles.groupHeader}><strong>Card 4: Mortgage</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="home_rates_c4_title" defaultValue={settings.home_rates_c4_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Subtitle</label>
                <input name="home_rates_c4_sub" defaultValue={settings.home_rates_c4_sub} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Row 1 Label</label>
                <input name="home_rates_c4_row1_label" defaultValue={settings.home_rates_c4_row1_label} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Row 1 Value</label>
                <input name="home_rates_c4_row1_value" defaultValue={settings.home_rates_c4_row1_value} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Text</label>
                <input name="home_rates_c4_btn_text" defaultValue={settings.home_rates_c4_btn_text} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Link</label>
                <input name="home_rates_c4_btn_link" defaultValue={settings.home_rates_c4_btn_link} className={styles.input} />
            </div>

            <div className={styles.groupHeader}><strong>Card 5: Auto</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="home_rates_c5_title" defaultValue={settings.home_rates_c5_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Subtitle</label>
                <input name="home_rates_c5_sub" defaultValue={settings.home_rates_c5_sub} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Badge Text</label>
                <input name="home_rates_c5_badge" defaultValue={settings.home_rates_c5_badge} className={styles.input} placeholder="LOW RATE" />
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Row 1 Label</label>
                    <input name="home_rates_c5_row1_label" defaultValue={settings.home_rates_c5_row1_label} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Row 1 Value</label>
                    <input name="home_rates_c5_row1_value" defaultValue={settings.home_rates_c5_row1_value} className={styles.input} />
                </div>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Text</label>
                <input name="home_rates_c5_btn_text" defaultValue={settings.home_rates_c5_btn_text} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Link</label>
                <input name="home_rates_c5_btn_link" defaultValue={settings.home_rates_c5_btn_link} className={styles.input} />
            </div>

            <div className={styles.groupHeader}><strong>Card 6: Personal</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="home_rates_c6_title" defaultValue={settings.home_rates_c6_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Subtitle</label>
                <input name="home_rates_c6_sub" defaultValue={settings.home_rates_c6_sub} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Row 1 Label</label>
                <input name="home_rates_c6_row1_label" defaultValue={settings.home_rates_c6_row1_label} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Row 1 Value</label>
                <input name="home_rates_c6_row1_value" defaultValue={settings.home_rates_c6_row1_value} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Text</label>
                <input name="home_rates_c6_btn_text" defaultValue={settings.home_rates_c6_btn_text} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Link</label>
                <input name="home_rates_c6_btn_link" defaultValue={settings.home_rates_c6_btn_link} className={styles.input} />
            </div>

            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Disclaimer</label>
                <textarea name="home_rates_disclaimer" defaultValue={settings.home_rates_disclaimer} className={styles.textarea} />
            </div>


            {/* 5. CARD SHOWCASE */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Card Showcase</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Series Name</label>
                <input name="home_card_series" defaultValue={settings.home_card_series} className={styles.input} />
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Main Title</label>
                    <input name="home_card_title" defaultValue={settings.home_card_title} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Highlight</label>
                    <input name="home_card_highlight" defaultValue={settings.home_card_highlight} className={styles.input} />
                </div>
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="home_card_desc" defaultValue={settings.home_card_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Card Section Image" value={homeCardUrl} onChange={setHomeCardUrl} />
                <input type="hidden" name="home_card_img" value={homeCardUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <textarea name="home_card_alt" defaultValue={settings.home_card_alt} className={styles.textarea} />
            </div>

            <div className={styles.groupHeader}><strong>Feature 1</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="home_card_feat_1" defaultValue={settings.home_card_feat_1} className={styles.input} placeholder="Title" />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="home_card_feat_1_desc" defaultValue={settings.home_card_feat_1_desc} className={styles.textarea} placeholder="Description" />
            </div>

            <div className={styles.groupHeader}><strong>Feature 2</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="home_card_feat_2" defaultValue={settings.home_card_feat_2} className={styles.input} placeholder="Title" />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="home_card_feat_2_desc" defaultValue={settings.home_card_feat_2_desc} className={styles.textarea} placeholder="Description" />
            </div>

            <div className={styles.groupHeader}><strong>Feature 3</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="home_card_feat_3" defaultValue={settings.home_card_feat_3} className={styles.input} placeholder="Title" />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="home_card_feat_3_desc" defaultValue={settings.home_card_feat_3_desc} className={styles.textarea} placeholder="Description" />
            </div>

            <div className={styles.groupHeader}><strong>CTA</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Button Text</label>
                <input name="home_card_btn1_text" defaultValue={settings.home_card_btn1_text} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Link</label>
                <input name="home_card_btn1_link" defaultValue={settings.home_card_btn1_link} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Text</label>
                <input name="home_card_btn2_text" defaultValue={settings.home_card_btn2_text} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Link</label>
                <input name="home_card_btn2_link" defaultValue={settings.home_card_btn2_link} className={styles.input} />
            </div>

            {/* 6. FINANCIAL GUIDANCE */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Financial Guidance</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Section Title</label>
                <input name="home_guide_title" defaultValue={settings.home_guide_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="home_guide_desc" defaultValue={settings.home_guide_desc} className={styles.textarea} />
            </div>
            <div className={styles.groupHeader}><strong>CTA</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Top Link Text</label>
                <input name="home_guide_link_text" defaultValue={settings.home_guide_link_text} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Top Link</label>
                <input name="home_guide_link" defaultValue={settings.home_guide_link} className={styles.input} />
            </div>

            <div className={styles.groupHeader}><strong>Article 1</strong></div>
            <div className={styles.group}>
                <ImageUploader label="Article 1 Image" value={guide1Url} onChange={setGuide1Url} />
                <input type="hidden" name="guide_article_1_img" value={guide1Url} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <textarea name="guide_article_1_alt" defaultValue={settings.guide_article_1_alt} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Head</label>
                <input name="guide_article_1_head" defaultValue={settings.guide_article_1_head} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="guide_article_1_title" defaultValue={settings.guide_article_1_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>SubTitle</label>
                <textarea name="guide_article_1_subtitle" defaultValue={settings.guide_article_1_subtitle} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Link Text</label>
                <input name="guide_article_1_link_text" defaultValue={settings.guide_article_1_link_text} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Link</label>
                <input name="guide_article_1_link" defaultValue={settings.guide_article_1_link} className={styles.input} />
            </div>

            <div className={styles.groupHeader}><strong>Article 2</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Head</label>
                <input name="guide_article_2_head" defaultValue={settings.guide_article_2_head} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="guide_article_2_title" defaultValue={settings.guide_article_2_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>SubTitle</label>
                <textarea name="guide_article_2_subtitle" defaultValue={settings.guide_article_2_subtitle} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Link Text</label>
                <input name="guide_article_2_link_text" defaultValue={settings.guide_article_2_link_text} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Link</label>
                <input name="guide_guide_article_2_link" defaultValue={settings.guide_article_2_link} className={styles.input} />
            </div>

            <div className={styles.groupHeader}><strong>Article 3</strong></div>
            <div className={styles.group}>
                <ImageUploader label="Article 3 Image" value={guide3Url} onChange={setGuide3Url} />
                <input type="hidden" name="guide_article_3_img" value={guide3Url} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <textarea name="guide_article_3_alt" defaultValue={settings.guide_article_3_alt} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Head</label>
                <input name="guide_article_3_head" defaultValue={settings.guide_article_3_head} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="guide_article_3_title" defaultValue={settings.guide_article_3_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>SubTitle</label>
                <textarea name="guide_article_3_subtitle" defaultValue={settings.guide_article_3_subtitle} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Link Text</label>
                <input name="guide_article_3_link_text" defaultValue={settings.guide_article_3_link_text} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Link</label>
                <input name="guide_article_3_link" defaultValue={settings.guide_article_3_link} className={styles.input} />
            </div>

            <div className={styles.groupHeader}><strong>Article 4</strong></div>
            <div className={styles.group}>
                <ImageUploader label="Article 4 Image" value={guide4Url} onChange={setGuide4Url} />
                <input type="hidden" name="guide_article_4_img" value={guide4Url} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <textarea name="guide_article_4_alt" defaultValue={settings.guide_article_4_alt} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Head</label>
                <input name="guide_article_4_head" defaultValue={settings.guide_article_4_head} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="guide_article_4_title" defaultValue={settings.guide_article_4_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>SubTitle</label>
                <textarea name="guide_article_4_subtitle" defaultValue={settings.guide_article_4_subtitle} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Link Text</label>
                <input name="guide_article_4_link_text" defaultValue={settings.guide_article_4_link_text} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Link</label>
                <input name="guide_article_4_link" defaultValue={settings.guide_article_4_link} className={styles.input} />
            </div>

            {/* 7. LOAN SECTION */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Loan Section</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Section Title</label>
                <input name="home_loan_title" defaultValue={settings.home_loan_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="home_loan_desc" defaultValue={settings.home_loan_desc} className={styles.textarea} />
            </div>

            <div className={styles.groupHeader}><strong>Icon Labels</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Category 1</label>
                <input name="home_loan_cat1_label" defaultValue={settings.home_loan_cat1_label} className={styles.input} placeholder="Home" />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Category 2</label>
                <input name="home_loan_cat2_label" defaultValue={settings.home_loan_cat2_label} className={styles.input} placeholder="Auto" />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Category 3</label>
                <input name="home_loan_cat3_label" defaultValue={settings.home_loan_cat3_label} className={styles.input} placeholder="Student" />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Category 4</label>
                <input name="home_loan_cat4_label" defaultValue={settings.home_loan_cat4_label} className={styles.input} placeholder="Business" />
            </div>

            <div className={styles.groupHeader}><strong>Card 1</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="home_loan_card1_title" defaultValue={settings.home_loan_card1_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="home_loan_card1_desc" defaultValue={settings.home_loan_card1_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Section Image" value={loan1Url} onChange={setLoan1Url} />
                <input type="hidden" name="home_loan_card1_img" value={loan1Url} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <textarea name="home_loan_card1_alt" defaultValue={settings.home_loan_card1_alt} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Stat 1 Label</label>
                <input name="home_loan_card1_stat1_label" defaultValue={settings.home_loan_card1_stat1_label} className={styles.input} />
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Stat 2 Label</label>
                    <input name="home_loan_card1_stat2_label" defaultValue={settings.home_loan_card1_stat2_label} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Stat 2 Value</label>
                    <input name="home_loan_card1_stat2_value" defaultValue={settings.home_loan_card1_stat2_value} className={styles.input} />
                </div>
            </div>
            <div className={styles.groupHeader}><strong>Card 1 Buttons</strong></div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Button 1 Text</label>
                    <input name="home_loan_card1_btn1_text" defaultValue={settings.home_loan_card1_btn1_text} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Button 1 Link</label>
                    <input name="home_loan_card1_btn1_link" defaultValue={settings.home_loan_card1_btn1_link} className={styles.input} />
                </div>
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Button 2 Text</label>
                    <input name="home_loan_card1_btn2_text" defaultValue={settings.home_loan_card1_btn2_text} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Button 2 Link</label>
                    <input name="home_loan_card1_btn2_link" defaultValue={settings.home_loan_card1_btn2_link} className={styles.input} />
                </div>
            </div>

            <div className={styles.groupHeader}><strong>Card 2</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="home_loan_card2_title" defaultValue={settings.home_loan_card2_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="home_loan_card2_desc" defaultValue={settings.home_loan_card2_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Section Image" value={loan2Url} onChange={setLoan2Url} />
                <input type="hidden" name="home_loan_card2_img" value={loan2Url} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <textarea name="home_loan_card2_alt" defaultValue={settings.home_loan_card2_alt} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Rate Note Text</label>
                <input name="home_loan_card2_note_text" defaultValue={settings.home_loan_card2_note_text} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>List 1</label>
                <input name="home_loan_card2_list1" defaultValue={settings.home_loan_card2_list1} className={styles.input} placeholder="Checklist 1" />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>List 2</label>
                <input name="home_loan_card2_list2" defaultValue={settings.home_loan_card2_list2} className={styles.input} placeholder="Checklist 2" />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>List 3</label>
                <input name="home_loan_card2_list3" defaultValue={settings.home_loan_card2_list3} className={styles.input} placeholder="Checklist 3" />
            </div>
            <div className={styles.groupHeader}><strong>Card 2 Buttons</strong></div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Button 1 Text</label>
                    <input name="home_loan_card2_btn1_text" defaultValue={settings.home_loan_card2_btn1_text} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Button 1 Link</label>
                    <input name="home_loan_card2_btn1_link" defaultValue={settings.home_loan_card2_btn1_link} className={styles.input} />
                </div>
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Button 2 Text</label>
                    <input name="home_loan_card2_btn2_text" defaultValue={settings.home_loan_card2_btn2_text} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Button 2 Link</label>
                    <input name="home_loan_card2_btn2_link" defaultValue={settings.home_loan_card2_btn2_link} className={styles.input} />
                </div>
            </div>

            {/* TOOLS STRIP */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Loan Tools</h3>
            </div>
            {/* Tool 1 */}
            <div className={styles.group}>
                <label className={styles.label}>Tool 1 Title</label>
                <input name="home_loan_tool1_title" defaultValue={settings.home_loan_tool1_title} className={styles.input} />
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Tool 1 Text</label>
                    <input name="home_loan_tool1_text" defaultValue={settings.home_loan_tool1_text} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Tool 1 Link</label>
                    <input name="home_loan_tool1_link" defaultValue={settings.home_loan_tool1_link} className={styles.input} />
                </div>
            </div>

            <div className={styles.group}>
                <label className={styles.label}>Tool 2 Title</label>
                <input name="home_loan_tool2_title" defaultValue={settings.home_loan_tool2_title} className={styles.input} />
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Tool 2 Text</label>
                    <input name="home_loan_tool2_text" defaultValue={settings.home_loan_tool2_text} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Tool 2 Link</label>
                    <input name="home_loan_tool2_link" defaultValue={settings.home_loan_tool2_link} className={styles.input} />
                </div>
            </div>

            <div className={styles.group}>
                <label className={styles.label}>Tool 3 Title</label>
                <input name="home_loan_tool3_title" defaultValue={settings.home_loan_tool3_title} className={styles.input} />
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Tool 3 Text</label>
                    <input name="home_loan_tool3_text" defaultValue={settings.home_loan_tool3_text} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Tool 3 Link</label>
                    <input name="home_loan_tool3_link" defaultValue={settings.home_loan_tool3_link} className={styles.input} />
                </div>
            </div>
            <div className={styles.groupHeader}><strong>Symbols & Units</strong></div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Percent Symbol</label>
                    <input name="home_loan_percent_symbol" defaultValue={settings.home_loan_percent_symbol} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>APR Text</label>
                    <input name="home_loan_apr_text" defaultValue={settings.home_loan_apr_text} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Arrow Symbol</label>
                    <input name="home_loan_arrow_symbol" defaultValue={settings.home_loan_arrow_symbol} className={styles.input} />
                </div>
            </div>

            {/* 8. INVESTMENT SECTION */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Investment Section</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="home_invest_title" defaultValue={settings.home_invest_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Highlight</label>
                <input name="home_invest_highlight" defaultValue={settings.home_invest_highlight} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="home_invest_desc" defaultValue={settings.home_invest_desc} className={styles.textarea} />
            </div>

            <div className={styles.group}>
                <ImageUploader label="Section Image" value={investUrl} onChange={setInvestUrl} />
                <input type="hidden" name="home_invest_img" value={investUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <textarea name="home_invest_alt" defaultValue={settings.home_invest_alt} className={styles.textarea} />
            </div>

            <div className={styles.groupHeader}><strong>Feature 1</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="home_invest_feat1" defaultValue={settings.home_invest_feat1} className={styles.input} placeholder="Title" />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="home_invest_feat1_desc" defaultValue={settings.home_invest_feat1_desc} className={styles.textarea} placeholder="Description" />
            </div>

            <div className={styles.groupHeader}><strong>Feature 2</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="home_invest_feat2" defaultValue={settings.home_invest_feat2} className={styles.input} placeholder="Title" />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="home_invest_feat2_desc" defaultValue={settings.home_invest_feat2_desc} className={styles.textarea} placeholder="Description" />
            </div>

            <div className={styles.groupHeader}><strong>Feature 3</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="home_invest_feat3" defaultValue={settings.home_invest_feat3} className={styles.input} placeholder="Title" />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="home_invest_feat3_desc" defaultValue={settings.home_invest_feat3_desc} className={styles.textarea} placeholder="Description" />
            </div>

            <div className={styles.groupHeader}><strong>Buttons</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Primary Button Text</label>
                <input name="home_invest_btn1_text" defaultValue={settings.home_invest_btn1_text} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Primary Button Link</label>
                <input name="home_invest_btn1_link" defaultValue={settings.home_invest_btn1_link} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Secondary Button Text</label>
                <input name="home_invest_btn2_text" defaultValue={settings.home_invest_btn2_text} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Secondary Button Link</label>
                <input name="home_invest_btn2_link" defaultValue={settings.home_invest_btn2_link} className={styles.input} />
            </div>

            <div className={styles.groupHeader}><strong>Floating Visuals</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Float 1 Label</label>
                <input name="home_invest_float1_label" defaultValue={settings.home_invest_float1_label} className={styles.input} placeholder="e.g. Bitcoin" />
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Float 2 Label</label>
                    <input name="home_invest_float2_label" defaultValue={settings.home_invest_float2_label} className={styles.input} placeholder="e.g. Auto-Invest" />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Float 2 Value</label>
                    <input name="home_invest_float2_value" defaultValue={settings.home_invest_float2_value} className={styles.input} placeholder="e.g. $500/mo" />
                </div>
            </div>

            {/* 9. GLOBAL REACH */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Global Reach</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="home_global_title" defaultValue={settings.home_global_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Highlight</label>
                <input name="home_global_highlight" defaultValue={settings.home_global_highlight} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="home_global_desc" defaultValue={settings.home_global_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Section Image" value={globalMapUrl} onChange={setGlobalMapUrl} />
                <input type="hidden" name="home_global_img" value={globalMapUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <textarea name="home_global_alt" defaultValue={settings.home_global_alt} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Hotspot Label</label>
                <input name="home_global_hotspot" defaultValue={settings.home_global_hotspot} className={styles.input} />
            </div>

            <div className={styles.groupHeader}><strong>Stats</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Countries</label>
                <input name="global_stat_countries" defaultValue={settings.global_stat_countries} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Countries Text</label>
                <input name="global_stat_countries_text" defaultValue={settings.global_stat_countries_text} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Countries Subtext</label>
                <input name="global_stat_countries_subtext" defaultValue={settings.global_stat_countries_subtext} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Digital %</label>
                <input name="global_stat_digital" defaultValue={settings.global_stat_digital} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Digital Text</label>
                <input name="global_stat_digital_text" defaultValue={settings.global_stat_digital_text} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Digital Subtext</label>
                <input name="global_stat_digital_subtext" defaultValue={settings.global_stat_digital_subtext} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Fraud Title</label>
                <input name="global_stat_fraud_title" defaultValue={settings.global_stat_fraud_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Fraud Monitor</label>
                <input name="global_stat_fraud" defaultValue={settings.global_stat_fraud} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Fraud Text</label>
                <input name="global_stat_fraud_text" defaultValue={settings.global_stat_fraud_text} className={styles.input} />
            </div>

            {/* 10. PARTNER LOGOS */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Partner Logos</h3>
                <p className={styles.subLabel}>Upload transparent PNG logos (approx 200x80px).</p>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="home_partner_label" defaultValue={settings.home_partner_label} className={styles.input} />
            </div>
            <div className={styles.groupHeader}><strong>Partners</strong></div>
            <div className={styles.group}>
                <ImageUploader label="Partner 1" value={partner1} onChange={setPartner1} />
                <input type="hidden" name="partner_img_1" value={partner1} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <textarea name="partner_img_1_alt" defaultValue={settings.partner_img_1_alt} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Partner 2" value={partner2} onChange={setPartner2} />
                <input type="hidden" name="partner_img_2" value={partner2} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <textarea name="partner_img_2_alt" defaultValue={settings.partner_img_2_alt} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Partner 3" value={partner3} onChange={setPartner3} />
                <input type="hidden" name="partner_img_3" value={partner3} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <textarea name="partner_img_3_alt" defaultValue={settings.partner_img_3_alt} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Partner 4" value={partner4} onChange={setPartner4} />
                <input type="hidden" name="partner_img_4" value={partner4} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <textarea name="partner_img_4_alt" defaultValue={settings.partner_img_4_alt} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Partner 5" value={partner5} onChange={setPartner5} />
                <input type="hidden" name="partner_img_5" value={partner5} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <textarea name="partner_img_5_alt" defaultValue={settings.partner_img_5_alt} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Partner 6" value={partner6} onChange={setPartner6} />
                <input type="hidden" name="partner_img_6" value={partner6} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <textarea name="partner_img_6_alt" defaultValue={settings.partner_img_6_alt} className={styles.textarea} />
            </div>

            {/* 11. FINAL CTA */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Final CTA </h3>
            </div>
            <div className={styles.fullWidth}></div>
            <div className={styles.group}>
                <label className={styles.label}>Badge Text</label>
                <input name="home_cta_badge" defaultValue={settings.home_cta_badge} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="home_cta_title" defaultValue={settings.home_cta_title} className={styles.input} />
            </div>
            <div className={styles.fullWidth}></div>
            <div className={styles.group}>
                <ImageUploader
                    label="Section Image"
                    value={homeCtaUrl}
                    onChange={setHomeCtaUrl} />
                <input type="hidden" name="home_cta_img"
                    value={homeCtaUrl}
                />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <textarea name="home_cta_alt" defaultValue={settings.home_cta_alt} className={styles.textarea} placeholder="e.g. Mobile app dashboard" />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="home_cta_desc" defaultValue={settings.home_cta_desc} className={styles.textarea} />
            </div>
            <div className={styles.groupHeader}><strong>Benefits List</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Benefit 1</label>
                <input name="home_cta_benefit_1" defaultValue={settings.home_cta_benefit_1} className={styles.input} placeholder="Benefit 1" />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Benefit 2</label>
                <input name="home_cta_benefit_2" defaultValue={settings.home_cta_benefit_2} className={styles.input} placeholder="Benefit 2" />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Benefit 3</label>
                <input name="home_cta_benefit_3" defaultValue={settings.home_cta_benefit_3} className={styles.input} placeholder="Benefit 3" />
            </div>
            <div className={styles.groupHeader}><strong>Apple Store Button</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Small Text</label>
                <input name="home_cta_apple_small" defaultValue={settings.home_cta_apple_small} className={styles.input} />
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Large Text</label>
                    <input name="home_cta_apple_large" defaultValue={settings.home_cta_apple_large} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Link</label>
                    <input name="home_cta_apple_link" defaultValue={settings.home_cta_apple_link} className={styles.input} />
                </div>
            </div>
            <div className={styles.groupHeader}><strong>Google Play Button</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Small Text</label>
                <input name="home_cta_google_small" defaultValue={settings.home_cta_google_small} className={styles.input} />
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Large Text</label>
                    <input name="home_cta_google_large" defaultValue={settings.home_cta_google_large} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Link</label>
                    <input name="home_cta_google_link" defaultValue={settings.home_cta_google_link} className={styles.input} />
                </div>
            </div>
                    <div className={styles.groupHeader}><strong>Web Link</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Text</label>
                <input name="home_cta_web_text" defaultValue={settings.home_cta_web_text} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Link</label>
                <input name="home_cta_web_link" defaultValue={settings.home_cta_web_link} className={styles.input} />
            </div>
        </div >
    );
}