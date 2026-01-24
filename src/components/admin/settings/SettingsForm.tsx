'use client';

import { useState } from 'react';
import { updateSiteSettings } from '@/actions/admin/settings';
import styles from './settings.module.css';
import { Save, Loader2, Home, CreditCard, TrendingUp, Layout, Menu, Scale, FileText, MapPin, Briefcase, ChevronRight, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface SettingsProps { settings: any; }

export default function SettingsForm({ settings }: SettingsProps) {
    const [isPending, setIsPending] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'banking' | 'products' | 'dashboard' | 'content' | 'nav' | 'legal'>('general');

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsPending(true);
        const formData = new FormData(event.currentTarget);
        const result = await updateSiteSettings(formData);
        if (result.success) toast.success("Saved!");
        else toast.error("Failed.");
        setIsPending(false);
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>System Configuration</h1>
                <p className={styles.subtitle}>Control content, rates, and alerts across the entire platform.</p>
            </header>

            <div className={styles.tabs}>
                <button type="button" onClick={() => setActiveTab('general')} className={`${styles.tabBtn} ${activeTab === 'general' ? styles.activeTab : ''}`}><Home size={16} /> General</button>
                <button type="button" onClick={() => setActiveTab('banking')} className={`${styles.tabBtn} ${activeTab === 'banking' ? styles.activeTab : ''}`}><TrendingUp size={16} /> Banking</button>
                <button type="button" onClick={() => setActiveTab('products')} className={`${styles.tabBtn} ${activeTab === 'products' ? styles.activeTab : ''}`}><CreditCard size={16} /> Products</button>
                <button type="button" onClick={() => setActiveTab('dashboard')} className={`${styles.tabBtn} ${activeTab === 'dashboard' ? styles.activeTab : ''}`}><Layout size={16} /> Dashboard</button>
                <button type="button" onClick={() => setActiveTab('content')} className={`${styles.tabBtn} ${activeTab === 'content' ? styles.activeTab : ''}`}><FileText size={16} /> Content</button>
                <button type="button" onClick={() => setActiveTab('nav')} className={`${styles.tabBtn} ${activeTab === 'nav' ? styles.activeTab : ''}`}><Menu size={16} /> Menus</button>
                <button type="button" onClick={() => setActiveTab('legal')} className={`${styles.tabBtn} ${activeTab === 'legal' ? styles.activeTab : ''}`}><Scale size={16} /> Legal</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.card}>

                {/* --- TAB 1: GENERAL --- */}
                {activeTab === 'general' && (
                    <div className={styles.grid}>
                        <div className={styles.fullWidth}><h3 className={styles.sectionTitle}>Brand Identity</h3></div>
                        <div className={styles.group}><label className={styles.label}>Site Name</label><input name="site_name" defaultValue={settings.site_name} className={styles.input} /></div>
                        <div className={styles.group}><label className={styles.label}>Logo URL</label><input name="site_logo" defaultValue={settings.site_logo} className={styles.input} /></div>

                        <div className={styles.fullWidth}><h3 className={styles.sectionTitle}>Home Hero</h3></div>
                        <div className={styles.group}><label className={styles.label}>Headline</label><input name="hero_title" defaultValue={settings.hero_title} className={styles.input} /></div>
                        <div className={styles.group}><label className={styles.label}>Button</label><input name="hero_cta_text" defaultValue={settings.hero_cta_text} className={styles.input} /></div>
                        <div className={`${styles.group} ${styles.fullWidth}`}><label className={styles.label}>Subtitle</label><textarea name="hero_subtitle" defaultValue={settings.hero_subtitle} className={styles.textarea} /></div>
                    </div>
                )}

                {/* --- TAB 2: BANKING & RATES --- */}
                {activeTab === 'banking' && (
                    <div className={styles.grid}>
                        <div className={styles.fullWidth}><h3 className={styles.sectionTitle}>Interest Rates</h3></div>
                        <div className={styles.group}><label className={styles.label}>HYSA APY (%)</label><input name="rate_hysa_apy" defaultValue={settings.rate_hysa_apy} className={styles.input} type="number" step="0.01" /></div>
                        <div className={styles.group}><label className={styles.label}>CD APY (%)</label><input name="rate_cd_apy" defaultValue={settings.rate_cd_apy} className={styles.input} type="number" step="0.01" /></div>
                        <div className={styles.group}><label className={styles.label}>Mortgage (%)</label><input name="rate_mortgage_30yr" defaultValue={settings.rate_mortgage_30yr} className={styles.input} type="number" step="0.01" /></div>
                        <div className={styles.group}><label className={styles.label}>Auto Loan (%)</label><input name="rate_auto_low" defaultValue={settings.rate_auto_low} className={styles.input} type="number" step="0.01" /></div>

                        <div className={styles.fullWidth}><h3 className={styles.sectionTitle}>Banking & Save Pages</h3></div>
                        <div className={styles.group}><label className={styles.label}>Bank Hero Title</label><input name="bank_hero_title_1" defaultValue={settings.bank_hero_title_1} className={styles.input} /></div>
                        <div className={styles.group}><label className={styles.label}>Save Hero Title</label><input name="save_hero_title" defaultValue={settings.save_hero_title} className={styles.input} /></div>
                    </div>
                )}

                {/* --- TAB 3: PRODUCTS --- */}
                {activeTab === 'products' && (
                    <div className={styles.grid}>
                        <div className={styles.fullWidth}><h3 className={styles.sectionTitle}>Lending</h3></div>
                        <div className={styles.group}><label className={styles.label}>Borrow Hero Title</label><input name="borrow_hero_title" defaultValue={settings.borrow_hero_title} className={styles.input} /></div>
                        <div className={styles.group}><label className={styles.label}>Borrow Description</label><textarea name="borrow_hero_desc" defaultValue={settings.borrow_hero_desc} className={styles.textarea} /></div>

                        <div className={styles.fullWidth}><h3 className={styles.sectionTitle}>Wealth & Crypto</h3></div>
                        <div className={styles.group}><label className={styles.label}>Wealth Hero Title</label><input name="wealth_hero_title" defaultValue={settings.wealth_hero_title} className={styles.input} /></div>
                        <div className={styles.group}><label className={styles.label}>Crypto Hero Title</label><input name="crypto_hero_title" defaultValue={settings.crypto_hero_title} className={styles.input} /></div>

                        <div className={styles.fullWidth}><h3 className={styles.sectionTitle}>Lifestyle</h3></div>
                        <div className={styles.group}><label className={styles.label}>Insure Hero Title</label><input name="insure_hero_title" defaultValue={settings.insure_hero_title} className={styles.input} /></div>
                        <div className={styles.group}><label className={styles.label}>Payments Hero Title</label><input name="payments_hero_title" defaultValue={settings.payments_hero_title} className={styles.input} /></div>
                        <div className={`${styles.group} ${styles.fullWidth}`}><label className={styles.label}>Learn Hero Title</label><input name="learn_hero_title" defaultValue={settings.learn_hero_title} className={styles.input} /></div>
                    </div>
                )}

                {/* --- TAB 4: DASHBOARD --- */}
                {activeTab === 'dashboard' && (
                    <div className={styles.grid}>
                        <div className={styles.fullWidth}><h3 className={styles.sectionTitle}>Alerts</h3></div>
                        <div className={styles.toggleWrapper}><input type="checkbox" name="dashboard_alert_show" defaultChecked={settings.dashboard_alert_show === 'true'} className={styles.checkbox} /><span className={styles.toggleLabel}>Active</span></div>
                        <div className={styles.group}><label className={styles.label}>Message</label><input name="dashboard_alert_msg" defaultValue={settings.dashboard_alert_msg} className={styles.input} /></div>

                        <div className={styles.fullWidth}><h3 className={styles.sectionTitle}>Promo Sidebar</h3></div>
                        <div className={styles.group}><label className={styles.label}>Title</label><input name="dashboard_promo_title" defaultValue={settings.dashboard_promo_title} className={styles.input} /></div>
                        <div className={styles.group}><label className={styles.label}>Button Label</label><input name="dashboard_promo_btn" defaultValue={settings.dashboard_promo_btn} className={styles.input} /></div>
                    </div>
                )}

                {/* --- TAB 5: CONTENT (LINKS) --- */}
                {activeTab === 'content' && (
                    <div className={styles.grid}>
                        <div className={styles.contentWarning}>
                            <strong>Content Managers</strong>
                            <p>Manage your dynamic lists here. These open in separate specialized editors.</p>
                        </div>

                        <div className={styles.contentGrid}>
                            <Link href="/admin/faqs" className={styles.navCard}>
                                <div className={styles.navIcon}><HelpCircle size={24} /></div>
                                <div>
                                    <h4>FAQs Manager</h4>
                                    <p>Edit support questions</p>
                                </div>
                                <ChevronRight size={16} className={styles.chevronIcon} />
                            </Link>

                            <Link href="/admin/jobs" className={styles.navCard}>
                                <div className={styles.navIcon}><Briefcase size={24} /></div>
                                <div>
                                    <h4>Careers / Jobs</h4>
                                    <p>Post open positions</p>
                                </div>
                                <ChevronRight size={16} className={styles.chevronIcon} />
                            </Link>

                            <Link href="/admin/branches" className={styles.navCard}>
                                <div className={styles.navIcon}><MapPin size={24} /></div>
                                <div>
                                    <h4>Branch Locations</h4>
                                    <p>Manage office addresses</p>
                                </div>
                                <ChevronRight size={16} className={styles.chevronIcon} />
                            </Link>
                        </div>
                    </div>
                )}

                {/* --- TAB 6: NAV --- */}
                {activeTab === 'nav' && (
                    <div className={styles.grid}>
                        <div className={styles.fullWidth}><h3 className={styles.sectionTitle}>Mega Menus</h3></div>
                        <div className={styles.group}><label className={styles.label}>Banking Promo Title</label><input name="nav_bank_title" defaultValue={settings.nav_bank_title} className={styles.input} /></div>
                        <div className={styles.group}><label className={styles.label}>Wealth Promo Title</label><input name="nav_wealth_title" defaultValue={settings.nav_wealth_title} className={styles.input} /></div>
                    </div>
                )}

                {/* --- TAB 7: LEGAL --- */}
                {activeTab === 'legal' && (
                    <div className={styles.grid}>
                        <div className={`${styles.fullWidth} ${styles.warningBox}`}>
                            <strong>Note:</strong> These fields accept HTML (e.g., &lt;h2&gt;, &lt;p&gt;). Be careful when editing.
                        </div>

                        <div className={`${styles.group} ${styles.fullWidth}`}>
                            <label className={styles.label}>Privacy Policy</label>
                            <textarea
                                name="legal_privacy_policy"
                                defaultValue={settings.legal_privacy_policy}
                                className={`${styles.textarea} ${styles.legalEditor}`}
                            />
                        </div>

                        <div className={`${styles.group} ${styles.fullWidth}`}>
                            <label className={styles.label}>Terms of Service</label>
                            <textarea
                                name="legal_terms_service"
                                defaultValue={settings.legal_terms_service}
                                className={`${styles.textarea} ${styles.legalEditor}`}
                            />
                        </div>

                        <div className={`${styles.group} ${styles.fullWidth}`}>
                            <label className={styles.label}>Accessibility Statement</label>
                            <textarea
                                name="legal_accessibility_statement"
                                defaultValue={settings.legal_accessibility_statement}
                                className={`${styles.textarea} ${styles.legalEditor}`}
                            />
                        </div>
                    </div>
                )}

                <div className={styles.actions}>
                    <button type="submit" disabled={isPending} className={styles.saveBtn}>
                        {isPending ? <Loader2 className={styles.spin} size={20} /> : <Save size={20} />} Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}