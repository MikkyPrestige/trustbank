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

            {/* 1. BRAND IDENTITY (Always Keep Top) */}
            <div className={styles.fullWidth}><h3 className={styles.sectionTitle}>Brand Identity</h3></div>
            <div className={styles.group}>
                <label className={styles.label}>Site Name</label>
                <input name="site_name" defaultValue={settings.site_name} className={styles.input} />
            </div>
            <div className={styles.group}>
                <ImageUploader
                    label="Site Logo"
                    value={logoUrl}
                    onChange={(url) => setLogoUrl(url)}
                />
                <input type="hidden" name="site_logo" value={logoUrl} />
            </div>

            {/* 2. TOP INFO BAR (PUBLIC WEBSITE) */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Top Info Bar</h3>
            </div>
            <div className={`${styles.group} ${styles.toggleWrapper}`}>
                <input
                    type="checkbox"
                    name="announcement_active"
                    value="true"
                    defaultChecked={settings.announcement_active === "true"}
                    className={styles.checkbox}
                />
                <label className={styles.toggleLabel}>Show Announcement Bar?</label>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Support Phone</label>
                <input name="announcement_contact_phone" defaultValue={settings.announcement_contact_phone} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Announcement Text</label>
                <input name="announcement_text" defaultValue={settings.announcement_text} className={styles.input} placeholder="e.g. Limited time offer..." />
            </div>

            {/* 3. HERO SECTION */}
            <div className={styles.fullWidth}><hr className={styles.divider} /><h3 className={styles.sectionTitle}>Home: Hero Section</h3></div>
            <div className={styles.group}>
                <label className={styles.label}>Hero Badge</label>
                <input name="hero_badge" defaultValue={settings.hero_badge} className={styles.input} placeholder="e.g. TRUST BANK PERSONAL" />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Hero Background Image" value={heroUrl} onChange={(url) => setHeroUrl(url)} />
                <input type="hidden" name="home_hero_img" value={heroUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <input name="home_hero_alt" defaultValue={settings.home_hero_alt} className={styles.input} />
            </div>
            <div className={styles.group}><label className={styles.label}>Headline</label><input name="hero_title" defaultValue={settings.hero_title} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Button</label><input name="hero_cta_text" defaultValue={settings.hero_cta_text} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><label className={styles.label}>Subtitle</label><textarea name="hero_subtitle" defaultValue={settings.hero_subtitle} className={styles.textarea} /></div>

            {/* 4. RATES GRID TEXT */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Home: Rates Grid</h3>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>Note: Edit the actual % values in the &quot;Banking&quot; tab.</p>
            </div>
            <div className={styles.group}><label className={styles.label}>Section Title</label><input name="home_rates_title" defaultValue={settings.home_rates_title} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><label className={styles.label}>Description</label><textarea name="home_rates_desc" defaultValue={settings.home_rates_desc} className={styles.textarea} /></div>

            {/* 5. CARD SHOWCASE */}
            <div className={styles.fullWidth}><hr className={styles.divider} /><h3 className={styles.sectionTitle}>Home: Card Showcase</h3></div>
            <div className={styles.group}>
                <ImageUploader label="Card Image (Transparent PNG)" value={homeCardUrl} onChange={setHomeCardUrl} />
                <input type="hidden" name="home_card_img" value={homeCardUrl} />
            </div>
            <div className={styles.group}><label className={styles.label}>Image Alt Text</label><input name="home_card_alt" defaultValue={settings.home_card_alt} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Series Name</label><input name="home_card_series" defaultValue={settings.home_card_series} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Main Title</label><input name="home_card_title" defaultValue={settings.home_card_title} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><label className={styles.label}>Description</label><textarea name="home_card_desc" defaultValue={settings.home_card_desc} className={styles.textarea} /></div>
            <div className={styles.fullWidth}><strong>Feature 1</strong></div>
            <div className={styles.group}><input name="home_card_feat_1" defaultValue={settings.home_card_feat_1} className={styles.input} placeholder="Title" /></div>
            <div className={styles.group}><input name="home_card_feat_1_desc" defaultValue={settings.home_card_feat_1_desc} className={styles.input} placeholder="Description" /></div>
            <div className={styles.fullWidth}><strong>Feature 2</strong></div>
            <div className={styles.group}><input name="home_card_feat_2" defaultValue={settings.home_card_feat_2} className={styles.input} placeholder="Title" /></div>
            <div className={styles.group}><input name="home_card_feat_2_desc" defaultValue={settings.home_card_feat_2_desc} className={styles.input} placeholder="Description" /></div>
            <div className={styles.fullWidth}><strong>Feature 3</strong></div>
            <div className={styles.group}><input name="home_card_feat_3" defaultValue={settings.home_card_feat_3} className={styles.input} placeholder="Title" /></div>
            <div className={styles.group}><input name="home_card_feat_3_desc" defaultValue={settings.home_card_feat_3_desc} className={styles.input} placeholder="Description" /></div>

            {/* 6. FINANCIAL GUIDANCE */}
            <div className={styles.fullWidth}><hr className={styles.divider} /><h3 className={styles.sectionTitle}>Home: Financial Guidance</h3></div>
            <div className={styles.group}><label className={styles.label}>Section Title</label><input name="home_guide_title" defaultValue={settings.home_guide_title} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><label className={styles.label}>Description</label><textarea name="home_guide_desc" defaultValue={settings.home_guide_desc} className={styles.textarea} /></div>
            {/* Article 1 */}
            <div className={styles.fullWidth}><strong>Article 1 (Large Card)</strong></div>
            <div className={styles.group}><input name="guide_article_1_title" defaultValue={settings.guide_article_1_title} className={styles.input} /></div>
            <div className={styles.group}><ImageUploader label="Background Image" value={guide1Url} onChange={setGuide1Url} /><input type="hidden" name="guide_article_1_img" value={guide1Url} /></div>
            <div className={styles.group}><label className={styles.label}>Alt Text</label><input name="guide_article_1_alt" defaultValue={settings.guide_article_1_alt} className={styles.input} /></div>
            {/* Article 2 */}
            <div className={styles.fullWidth}><strong>Article 2 (Gold Card - No Image)</strong></div>
            <div className={styles.group}><input name="guide_article_2_title" defaultValue={settings.guide_article_2_title} className={styles.input} /></div>
            {/* Article 3 */}
            <div className={styles.fullWidth}><strong>Article 3 (Small Card)</strong></div>
            <div className={styles.group}><input name="guide_article_3_title" defaultValue={settings.guide_article_3_title} className={styles.input} /></div>
            <div className={styles.group}><ImageUploader label="Background Image" value={guide3Url} onChange={setGuide3Url} /><input type="hidden" name="guide_article_3_img" value={guide3Url} /></div>
            <div className={styles.group}><label className={styles.label}>Alt Text</label><input name="guide_article_3_alt" defaultValue={settings.guide_article_3_alt} className={styles.input} /></div>
            {/* Article 4 */}
            <div className={styles.fullWidth}><strong>Article 4 (Wide Card)</strong></div>
            <div className={styles.group}><input name="guide_article_4_title" defaultValue={settings.guide_article_4_title} className={styles.input} /></div>
            <div className={styles.group}><ImageUploader label="Background Image" value={guide4Url} onChange={setGuide4Url} /><input type="hidden" name="guide_article_4_img" value={guide4Url} /></div>
            <div className={styles.group}><label className={styles.label}>Alt Text</label><input name="guide_article_4_alt" defaultValue={settings.guide_article_4_alt} className={styles.input} /></div>

            {/* 7. LOAN SECTION */}
            <div className={styles.fullWidth}><hr className={styles.divider} /><h3 className={styles.sectionTitle}>Home: Loan Section</h3></div>
            <div className={styles.group}><label className={styles.label}>Section Title</label><input name="home_loan_title" defaultValue={settings.home_loan_title} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><label className={styles.label}>Description</label><textarea name="home_loan_desc" defaultValue={settings.home_loan_desc} className={styles.textarea} /></div>
            {/* Card 1 */}
            <div className={styles.fullWidth}><strong>Card 1 (Mortgage)</strong></div>
            <div className={styles.group}><input name="home_loan_card1_title" defaultValue={settings.home_loan_card1_title} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><textarea name="home_loan_card1_desc" defaultValue={settings.home_loan_card1_desc} className={styles.textarea} /></div>
            <div className={styles.group}><ImageUploader label="Image" value={loan1Url} onChange={setLoan1Url} /><input type="hidden" name="home_loan_card1_img" value={loan1Url} /></div>
            <div className={styles.group}><label className={styles.label}>Alt Text</label><input name="home_loan_card1_alt" defaultValue={settings.home_loan_card1_alt} className={styles.input} /></div>
            {/* Card 2 */}
            <div className={styles.fullWidth}><strong>Card 2 (Auto)</strong></div>
            <div className={styles.group}><input name="home_loan_card2_title" defaultValue={settings.home_loan_card2_title} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><textarea name="home_loan_card2_desc" defaultValue={settings.home_loan_card2_desc} className={styles.textarea} /></div>
            <div className={styles.group}><ImageUploader label="Image" value={loan2Url} onChange={setLoan2Url} /><input type="hidden" name="home_loan_card2_img" value={loan2Url} /></div>
            <div className={styles.group}><label className={styles.label}>Alt Text</label><input name="home_loan_card2_alt" defaultValue={settings.home_loan_card2_alt} className={styles.input} /></div>

            {/* 8. INVESTMENT SECTION */}
            <div className={styles.fullWidth}><hr className={styles.divider} /><h3 className={styles.sectionTitle}>Home: Investment Section</h3></div>
            <div className={styles.group}><label className={styles.label}>Title</label><input name="home_invest_title" defaultValue={settings.home_invest_title} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Highlight (Blue Text)</label><input name="home_invest_highlight" defaultValue={settings.home_invest_highlight} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><label className={styles.label}>Description</label><textarea name="home_invest_desc" defaultValue={settings.home_invest_desc} className={styles.textarea} /></div>
            <div className={styles.group}><ImageUploader label="App Visual (Phone)" value={investUrl} onChange={setInvestUrl} /><input type="hidden" name="home_invest_img" value={investUrl} /></div>
            <div className={styles.group}><label className={styles.label}>Image Alt Text</label><input name="home_invest_alt" defaultValue={settings.home_invest_alt} className={styles.input} /></div>
            <div className={styles.fullWidth}><strong>Feature 1</strong></div>
            <div className={styles.group}><input name="home_invest_feat1" defaultValue={settings.home_invest_feat1} className={styles.input} placeholder="Title" /></div>
            <div className={styles.group}><input name="home_invest_feat1_desc" defaultValue={settings.home_invest_feat1_desc} className={styles.input} placeholder="Description" /></div>
            <div className={styles.fullWidth}><strong>Feature 2</strong></div>
            <div className={styles.group}><input name="home_invest_feat2" defaultValue={settings.home_invest_feat2} className={styles.input} placeholder="Title" /></div>
            <div className={styles.group}><input name="home_invest_feat2_desc" defaultValue={settings.home_invest_feat2_desc} className={styles.input} placeholder="Description" /></div>
            <div className={styles.fullWidth}><strong>Feature 3</strong></div>
            <div className={styles.group}><input name="home_invest_feat3" defaultValue={settings.home_invest_feat3} className={styles.input} placeholder="Title" /></div>
            <div className={styles.group}><input name="home_invest_feat3_desc" defaultValue={settings.home_invest_feat3_desc} className={styles.input} placeholder="Description" /></div>

            {/* 9. GLOBAL REACH */}
            <div className={styles.fullWidth}><hr className={styles.divider} /><h3 className={styles.sectionTitle}>Home: Global Reach</h3></div>
            <div className={styles.group}><label className={styles.label}>Title</label><input name="home_global_title" defaultValue={settings.home_global_title} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Highlight (Blue)</label><input name="home_global_highlight" defaultValue={settings.home_global_highlight} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><label className={styles.label}>Description</label><textarea name="home_global_desc" defaultValue={settings.home_global_desc} className={styles.textarea} /></div>
            <div className={styles.group}><ImageUploader label="Map Visual" value={globalMapUrl} onChange={setGlobalMapUrl} /><input type="hidden" name="home_global_img" value={globalMapUrl} /></div>
            <div className={styles.group}><label className={styles.label}>Map Alt Text</label><input name="home_global_alt" defaultValue={settings.home_global_alt} className={styles.input} /></div>
            <div className={styles.fullWidth}><strong>Stats</strong></div>
            <div className={styles.group}><label className={styles.label}>Countries</label><input name="global_stat_countries" defaultValue={settings.global_stat_countries} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Digital %</label><input name="global_stat_digital" defaultValue={settings.global_stat_digital} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Fraud Monitor</label><input name="global_stat_fraud" defaultValue={settings.global_stat_fraud} className={styles.input} /></div>

            {/* 10. PARTNER LOGOS */}
            <div className={styles.fullWidth}><hr className={styles.divider} /><h3 className={styles.sectionTitle}>Home: Partner Logos</h3><p style={{ fontSize: '0.9rem', color: '#666' }}>Upload transparent PNG logos (approx 200x80px).</p></div>
            <div className={styles.group}><ImageUploader label="Partner 1" value={partner1} onChange={setPartner1} /><input type="hidden" name="partner_img_1" value={partner1} /></div>
            <div className={styles.group}><ImageUploader label="Partner 2" value={partner2} onChange={setPartner2} /><input type="hidden" name="partner_img_2" value={partner2} /></div>
            <div className={styles.group}><ImageUploader label="Partner 3" value={partner3} onChange={setPartner3} /><input type="hidden" name="partner_img_3" value={partner3} /></div>
            <div className={styles.group}><ImageUploader label="Partner 4" value={partner4} onChange={setPartner4} /><input type="hidden" name="partner_img_4" value={partner4} /></div>
            <div className={styles.group}><ImageUploader label="Partner 5" value={partner5} onChange={setPartner5} /><input type="hidden" name="partner_img_5" value={partner5} /></div>
            <div className={styles.group}><ImageUploader label="Partner 6" value={partner6} onChange={setPartner6} /><input type="hidden" name="partner_img_6" value={partner6} /></div>

            {/* 11. FINAL CTA */}
            <div className={styles.fullWidth}><hr className={styles.divider} /><h3 className={styles.sectionTitle}>Home: Final CTA (App Download)</h3></div>
            <div className={styles.group}><ImageUploader label="App Visual (Phone Mockup)" value={homeCtaUrl} onChange={setHomeCtaUrl} /><input type="hidden" name="home_cta_img" value={homeCtaUrl} /></div>
            <div className={styles.group}><label className={styles.label}>Image Alt Text</label><input name="home_cta_alt" defaultValue={settings.home_cta_alt} className={styles.input} placeholder="e.g. Mobile app dashboard" /></div>
            <div className={styles.group}><label className={styles.label}>Title</label><input name="home_cta_title" defaultValue={settings.home_cta_title} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><label className={styles.label}>Description</label><textarea name="home_cta_desc" defaultValue={settings.home_cta_desc} className={styles.textarea} /></div>
            <div className={styles.fullWidth}><strong>Benefits List</strong></div>
            <div className={styles.group}><input name="home_cta_benefit_1" defaultValue={settings.home_cta_benefit_1} className={styles.input} placeholder="Benefit 1" /></div>
            <div className={styles.group}><input name="home_cta_benefit_2" defaultValue={settings.home_cta_benefit_2} className={styles.input} placeholder="Benefit 2" /></div>
            <div className={styles.group}><input name="home_cta_benefit_3" defaultValue={settings.home_cta_benefit_3} className={styles.input} placeholder="Benefit 3" /></div>

        </div>
    );
}