'use client';

import Link from 'next/link';
import ImageUploader from "@/components/admin/media/ImageUploader";
import styles from "../settings.module.css";
import { HelpCircle, Briefcase, MapPin, ArrowRight } from 'lucide-react';

interface ContentTabProps {
    settings: any;
    careersHeroUrl: string;
    setCareersHeroUrl: (url: string) => void;
    pressHeroUrl: string;
    setPressHeroUrl: (url: string) => void;
    investHeroUrl: string;
    setInvestHeroUrl: (url: string) => void;
}

export function ContentTab({ settings, careersHeroUrl, setCareersHeroUrl, pressHeroUrl, setPressHeroUrl, investHeroUrl, setInvestHeroUrl }: ContentTabProps) {
    return (
        <div className={styles.grid}>
            {/* --- SECTION 1: MODULE NAVIGATION CONFIG--- */}
            <div className={styles.fullWidth}>
                <h3 className={styles.sectionTitle}>Content Modules</h3>
                <p className={styles.sectionSubtitle}>Click below to add or edit the actual items (Questions, Jobs, Locations).</p>
            </div>
            {/* Navigation Cards */}
            <div className={`${styles.fullWidth} ${styles.modulesGrid}`}>
                <Link href="/admin/faqs" className={styles.navCard}>
                    <div className={styles.navIcon}><HelpCircle size={24} /></div>
                    <div>
                        <h4>Manage FAQs</h4>
                        <p>Add/Edit Questions</p>
                    </div>
                    <ArrowRight size={16} className={styles.chevronIcon} />
                </Link>
                <Link href="/admin/careers" className={styles.navCard}>
                    <div className={styles.navIcon}><Briefcase size={24} /></div>
                    <div>
                        <h4>Manage Careers</h4>
                        <p>Job Postings</p>
                    </div>
                    <ArrowRight size={16} className={styles.chevronIcon} />
                </Link>
                <Link href="/admin/branches" className={styles.navCard}>
                    <div className={styles.navIcon}><MapPin size={24} /></div>
                    <div>
                        <h4>Manage Branches</h4>
                        <p>Locations & Maps</p>
                    </div>
                    <ArrowRight size={16} className={styles.chevronIcon} />
                </Link>
            </div>

            {/* --- SECTION 2: HELP PAGE CONFIG --- */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Help Page Headers</h3>
                <p className={styles.sectionSubtitle}>Edit the static text that appears on the Help Center page.</p>
            </div>
            {/* Hero Section */}
            <div className={styles.group}>
                <label className={styles.label}>Hero Title</label>
                <input name="help_hero_title" defaultValue={settings.help_hero_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Hero Subtitle</label>
                <input name="help_hero_desc" defaultValue={settings.help_hero_desc} className={styles.input} />
            </div>
            {/* Quick Actions Section */}
            <div className={styles.fullWidth}>
                <h4 className={styles.subsectionTitle}>Quick Action Cards</h4>
            </div>
            {/* Card 1 */}
            <div className={styles.group}>
                <label className={styles.label}>Action 1: Reset Password</label>
                <input name="help_action1_title" defaultValue={settings.help_action1_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <input name="help_action1_desc" defaultValue={settings.help_action1_desc} className={styles.input} placeholder="Description" />
            </div>
            {/* Card 2 */}
            <div className={styles.group}>
                <label className={styles.label}>Action 2: Lost Card</label>
                <input name="help_action2_title" defaultValue={settings.help_action2_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <input name="help_action2_desc" defaultValue={settings.help_action2_desc} className={styles.input} placeholder="Description" />
            </div>
            {/* Card 3 */}
            <div className={styles.group}>
                <label className={styles.label}>Action 3: Report Fraud</label>
                <input name="help_action3_title" defaultValue={settings.help_action3_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <input name="help_action3_desc" defaultValue={settings.help_action3_desc} className={styles.input} placeholder="Description" />
            </div>
            {/* Card 4 */}
            <div className={styles.group}>
                <label className={styles.label}>Action 4: Routing Info</label>
                <input name="help_action4_title" defaultValue={settings.help_action4_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <input name="help_action4_desc" defaultValue={settings.help_action4_desc} className={styles.input} placeholder="Description" />
            </div>
            {/* Bottom CTA Section */}
            <div className={styles.fullWidth}>
                <h4 className={styles.subsectionTitle}>Bottom Contact Strip</h4>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Strip Title</label>
                <input name="help_cta_title" defaultValue={settings.help_cta_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Strip Description</label>
                <input name="help_cta_desc" defaultValue={settings.help_cta_desc} className={styles.input} />
            </div>
            {/* Note to User */}
            <div className={styles.fullWidth}>
                <p className={`${styles.sectionSubtitle} ${styles.note}`}>
                    <em>Note: The phone number used in the Contact Strip is pulled from the <strong>Support Tab</strong> settings.</em>
                </p>
            </div>

            {/* --- SECTION 3: CAREERS PAGE CONFIG  --- */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Careers Page Configuration</h3>
                <p className={styles.sectionSubtitle}>Edit the &quot;Why Join Us&quot; content.</p>
            </div>
            {/* Hero */}
            <div className={styles.group}>
                <label className={styles.label}>Hero Title</label>
                <input name="careers_hero_title" defaultValue={settings.careers_hero_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Hero Description</label>
                <textarea name="careers_hero_desc" defaultValue={settings.careers_hero_desc} className={styles.textarea} />
            </div>
            {/*  IMAGE UPLOADER  */}
            <div className={styles.group}>
                <ImageUploader
                    label="Hero Background Image"
                    value={careersHeroUrl}
                    onChange={setCareersHeroUrl}
                />
                <input type="hidden" name="careers_hero_img" value={careersHeroUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text (Accessibility)</label>
                <input
                    name="careers_hero_img_alt"
                    defaultValue={settings.careers_hero_img_alt}
                    className={styles.input}
                    placeholder="Describe the image for screen readers"
                />
            </div>
            {/* Value Props */}
            <div className={styles.fullWidth}>
                <h4 className={styles.subsectionTitle}>Company Values</h4>
            </div>
            {/* Value 1 */}
            <div className={styles.group}>
                <label className={styles.label}>Value 1 (Zap Icon)</label>
                <input name="careers_val1_title" defaultValue={settings.careers_val1_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <input name="careers_val1_desc" defaultValue={settings.careers_val1_desc} className={styles.input} placeholder="Description" />
            </div>
            {/* Value 2 */}
            <div className={styles.group}>
                <label className={styles.label}>Value 2 (Users Icon)</label>
                <input name="careers_val2_title" defaultValue={settings.careers_val2_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <input name="careers_val2_desc" defaultValue={settings.careers_val2_desc} className={styles.input} placeholder="Description" />
            </div>
            {/* Value 3 */}
            <div className={styles.group}>
                <label className={styles.label}>Value 3 (Heart Icon)</label>
                <input name="careers_val3_title" defaultValue={settings.careers_val3_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <input name="careers_val3_desc" defaultValue={settings.careers_val3_desc} className={styles.input} placeholder="Description" />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Hero Button Text</label>
                <input name="careers_hero_btn_text" defaultValue={settings.careers_hero_btn_text} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Hero Button Link</label>
                <input name="careers_hero_btn_link" defaultValue={settings.careers_hero_btn_link} className={styles.input} />
            </div>
            {/* Values Section */}
            <div className={styles.fullWidth}>
                <h4 className={styles.subsectionTitle}>Company Values</h4>
            </div>
            <div className={styles.group} style={{ marginBottom: '1rem' }}>
                <label className={styles.label}>Section Subtitle</label>
                <input name="careers_values_subtitle" defaultValue={settings.careers_values_subtitle} className={styles.input} style={{ width: '100%' }} />
            </div>
            {/* Job Board Section */}
            <div className={styles.fullWidth}>
                <h4 className={styles.subsectionTitle}>Job Board Labels</h4>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Board Title</label>
                <input name="careers_jobs_title" defaultValue={settings.careers_jobs_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>&quot;No Roles&quot; Message</label>
                <input name="careers_jobs_no_roles" defaultValue={settings.careers_jobs_no_roles} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Email Prompt Text</label>
                <input name="careers_jobs_email_text" defaultValue={settings.careers_jobs_email_text} className={styles.input} />
            </div>

            {/* --- SECTION 4: LOCATIONS PAGE CONFIG --- */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Locations Page Configuration</h3>
                <p className={styles.sectionSubtitle}>Edit the search header text.</p>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Page Title</label>
                <input name="locations_hero_title" defaultValue={settings.locations_hero_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Search Placeholder</label>
                <input name="locations_search_placeholder" defaultValue={settings.locations_search_placeholder} className={styles.input} />
            </div>
            <div className={styles.fullWidth}>
                <h4 className={styles.subsectionTitle}>Interface Labels</h4>
            </div>
            {/* Search & Results */}
            <div className={styles.group}>
                <label className={styles.label}>Search Button Text</label>
                <input name="locations_search_btn_text" defaultValue={settings.locations_search_btn_text} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>&quot;Locations Found&quot; Label</label>
                <input name="locations_results_label" defaultValue={settings.locations_results_label} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>&quot;No Results&quot; Text</label>
                <input name="locations_no_results_text" defaultValue={settings.locations_no_results_text} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Clear Button Text</label>
                <input name="locations_clear_btn_text" defaultValue={settings.locations_clear_btn_text} className={styles.input} />
            </div>
            {/* Card Details */}
            <div className={styles.group}>
                <label className={styles.label}>&quot;Open Now&quot; Label</label>
                <input name="locations_open_label" defaultValue={settings.locations_open_label} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Directions Button Text</label>
                <input name="locations_directions_btn_text" defaultValue={settings.locations_directions_btn_text} className={styles.input} />
            </div>
            {/* Service Tags */}
            <div className={styles.fullWidth}>
                <h4 className={styles.subsectionTitle}>Service Tags</h4>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>ATM Tag</label>
                <input name="locations_tag_atm" defaultValue={settings.locations_tag_atm} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Drive-Thru Tag</label>
                <input name="locations_tag_drive_thru" defaultValue={settings.locations_tag_drive_thru} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Notary Tag</label>
                <input name="locations_tag_notary" defaultValue={settings.locations_tag_notary} className={styles.input} />
            </div>

            {/* --- SECTION 5: PRESS PAGE CONFIG --- */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Press Page Configuration</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Hero Title</label>
                <input name="press_hero_title" defaultValue={settings.press_hero_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Hero Description</label>
                <input name="press_hero_desc" defaultValue={settings.press_hero_desc} className={styles.input} />
            </div>
            <div className={styles.group}>
                <ImageUploader
                    label="Hero Background Image"
                    value={pressHeroUrl}
                    onChange={setPressHeroUrl}
                />
                <input type="hidden" name="press_hero_img" value={pressHeroUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text (Accessibility)</label>
                <input
                    name="press_hero_img_alt"
                    defaultValue={settings.press_hero_img_alt}
                    className={styles.input}
                    placeholder="Describe the image..."
                />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Media Kit Title</label>
                <input name="press_kit_title" defaultValue={settings.press_kit_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Media Kit Link (URL)</label>
                <input name="press_kit_link" defaultValue={settings.press_kit_link} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Press Contact Email</label>
                <input name="press_contact_email" defaultValue={settings.press_contact_email} className={styles.input} />
            </div>
            <div className={styles.fullWidth}>
                <h4 className={styles.subsectionTitle}>Interface Labels</h4>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>&quot;No News&quot; Message</label>
                <input name="press_empty_state" defaultValue={settings.press_empty_state} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>&quot;Read More&quot; Link Text</label>
                <input name="press_read_more_text" defaultValue={settings.press_read_more_text} className={styles.input} />
            </div>
            {/* Media Kit Details */}
            <div className={styles.fullWidth}>
                <h4 className={styles.subsectionTitle}>Media Kit File Info</h4>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>File Name Display</label>
                <input name="press_file_name" defaultValue={settings.press_file_name} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>File Size Label</label>
                <input name="press_file_size" defaultValue={settings.press_file_size} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Download Button Text</label>
                <input name="press_download_btn_text" defaultValue={settings.press_download_btn_text} className={styles.input} />
            </div>
            {/* Sidebar About Section */}
            <div className={styles.fullWidth}>
                <h4 className={styles.subsectionTitle}>Sidebar &quot;About&quot; Widget</h4>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Widget Title</label>
                <input name="press_about_title" defaultValue={settings.press_about_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Widget Description</label>
                <textarea name="press_about_desc" defaultValue={settings.press_about_desc} className={styles.textarea} />
            </div>

            {/* --- SECTION 6: INVESTORS PAGE CONFIG --- */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Investors Page Configuration</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Hero Title</label>
                <input name="invest_hero_title" defaultValue={settings.invest_hero_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Hero Description</label>
                <input name="invest_hero_desc" defaultValue={settings.invest_hero_desc} className={styles.input} />
            </div>
            <div className={styles.group}>
                <ImageUploader
                    label="Hero Background Image"
                    value={investHeroUrl}
                    onChange={setInvestHeroUrl}
                />
                <input type="hidden" name="invest_hero_img" value={investHeroUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <input name="invest_hero_img_alt" defaultValue={settings.invest_hero_img_alt} className={styles.input} />
            </div>
            {/* Stock Ticker */}
            <div className={styles.fullWidth}>
                <h4 className={styles.subsectionTitle}>Stock Ticker Data</h4>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Stock Price</label>
                <input name="invest_stock_price" defaultValue={settings.invest_stock_price} className={styles.input} placeholder="$142.50" />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Change % (use ▲ or ▼)</label>
                <input name="invest_stock_change" defaultValue={settings.invest_stock_change} className={styles.input} placeholder="▲ 1.2%" />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Ticker Symbol</label>
                <input name="invest_ticker_symbol" defaultValue={settings.invest_ticker_symbol} className={styles.input} placeholder="NYSE: TRST" />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Market Cap Label</label>
                <input name="invest_market_cap" defaultValue={settings.invest_market_cap} className={styles.input} />
            </div>
            <div className={styles.fullWidth}>
                <h4 className={styles.subsectionTitle}>Section Headers</h4>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Reports Title</label>
                <input name="invest_reports_title" defaultValue={settings.invest_reports_title} className={styles.input} />
            </div>
            {/* BUTTON LABELS */}
            <div className={styles.fullWidth}>
                <h4 className={styles.subsectionTitle}>Report Button Labels</h4>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>&quot;Download PDF&quot; Text</label>
                <input name="invest_download_pdf_text" defaultValue={settings.invest_download_pdf_text} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>&quot;View External&quot; Text</label>
                <input name="invest_view_link_text" defaultValue={settings.invest_view_link_text} className={styles.input} />
            </div>
        </div>
    );
}