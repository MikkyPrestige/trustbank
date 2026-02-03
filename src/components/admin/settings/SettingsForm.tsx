'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSiteSettings } from '@/actions/admin/settings';
import { MEGA_MENUS } from "@/lib/utils/constants";
import styles from './settings.module.css';
import {
    Save, Loader2, Home, Menu, Scale, FileText, PiggyBank, HandCoins,
    Gem, ShieldCheck, ArrowRightLeft, Users, BookOpen, Shield, Headset,
    MapPin, Briefcase, HelpCircle, Landmark, Percent, LineChart, Bitcoin
} from 'lucide-react';
import toast from 'react-hot-toast';

// Tabs
import { HomeTab } from "./tabs/HomeTab";
import { BankingTab } from "./tabs/BankingTab";
import { SaveTab } from "./tabs/SaveTab";
import { BorrowTab } from "./tabs/BorrowTab";
import { WealthTab } from "./tabs/WealthTab";
import { CryptoTab } from "./tabs/CryptoTab";
import { InsureTab } from "./tabs/InsureTab";
import { PaymentsTab } from "./tabs/PaymentsTab";
import { RatesTab } from "./tabs/RatesTab";
import { LocationsTab } from './tabs/LocationsTab';
import { LearnTab } from "./tabs/LearnTab";
import { AboutTab } from "./tabs/AboutTab";
import { JobsTab } from './tabs/JobsTab';
import { InvestorsTab } from './tabs/InvestorsTab';
import { PressTab } from "./tabs/PressTab";
import { SupportTab } from "./tabs/SupportTab";
import { FaqTab } from './tabs/FaqTab';
import { SecurityTab } from "./tabs/SecurityTab";
import { LegalTab } from "./tabs/LegalTab";
import { NavTab } from "./tabs/NavTab";
import { FooterTab } from './tabs/FooterTab';

interface SettingsProps { settings: any; footerLinks: any[]; }

export default function SettingsForm({ settings, footerLinks }: SettingsProps) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    // Default to 'home'
    const [activeTab, setActiveTab] = useState<string>('home');

    // --- 1. HOME IMAGES ---
    const [heroUrl, setHeroUrl] = useState(settings.home_hero_img || "");
    const [homeCardUrl, setHomeCardUrl] = useState(settings.home_card_img || "");
    const [homeCtaUrl, setHomeCtaUrl] = useState(settings.home_cta_img || "");
    const [guide1Url, setGuide1Url] = useState(settings.guide_article_1_img || "");
    const [guide3Url, setGuide3Url] = useState(settings.guide_article_3_img || "");
    const [guide4Url, setGuide4Url] = useState(settings.guide_article_4_img || "");
    const [loan1Url, setLoan1Url] = useState(settings.home_loan_card1_img || "");
    const [loan2Url, setLoan2Url] = useState(settings.home_loan_card2_img || "");
    const [investUrl, setInvestUrl] = useState(settings.home_invest_img || "");
    const [globalMapUrl, setGlobalMapUrl] = useState(settings.home_global_img || "");

    // --- 2. PARTNERS ---
    const [partner1, setPartner1] = useState(settings.partner_img_1 || "");
    const [partner2, setPartner2] = useState(settings.partner_img_2 || "");
    const [partner3, setPartner3] = useState(settings.partner_img_3 || "");
    const [partner4, setPartner4] = useState(settings.partner_img_4 || "");
    const [partner5, setPartner5] = useState(settings.partner_img_5 || "");
    const [partner6, setPartner6] = useState(settings.partner_img_6 || "");

    // --- 3. PRODUCTS ---
    const [bankHeroUrl, setBankHeroUrl] = useState(settings.bank_hero_img || "");
    const [bankCSUrl, setBankCSUrl] = useState(settings.bank_cs_img || "");
    const [bankBizUrl, setBankBizUrl] = useState(settings.bank_biz_img || "");
    const [bankStuUrl, setBankStuUrl] = useState(settings.bank_stu_img || "");

    const [saveHeroUrl, setSaveHeroUrl] = useState(settings.save_hero_img || "");
    const [saveCdsUrl, setSaveCdsUrl] = useState(settings.save_cds_img || "");
    const [saveMmaUrl, setSaveMmaUrl] = useState(settings.save_mma_img || "");
    const [saveKidsUrl, setSaveKidsUrl] = useState(settings.save_kids_img || "");

    const [borrowHeroUrl, setBorrowHeroUrl] = useState(settings.borrow_hero_img || "");
    const [borrowCCUrl, setBorrowCCUrl] = useState(settings.borrow_cc_img || "");
    const [borrowPLUrl, setBorrowPLUrl] = useState(settings.borrow_pl_img || "");
    const [borrowMTUrl, setBorrowMTUrl] = useState(settings.borrow_mt_img || "");
    const [borrowALUrl, setBorrowALUrl] = useState(settings.borrow_al_img || "");
    const [borrowSLUrl, setBorrowSLUrl] = useState(settings.borrow_sl_img || "");
    const [borrowHEUrl, setBorrowHEUrl] = useState(settings.borrow_he_img || "");

    const [wealthHeroUrl, setWealthHeroUrl] = useState(settings.wealth_hero_img || "");
    const [wealthPcgUrl, setWealthPcgUrl] = useState(settings.wealth_pcg_img || "");
    const [wealthRetUrl, setWealthRetUrl] = useState(settings.wealth_retirement_img || "");
    const [wealthEstUrl, setWealthEstUrl] = useState(settings.wealth_estate_img || "");
    const [cryptoHeroUrl, setCryptoHeroUrl] = useState(settings.crypto_hero_img || "");

    const [insureHeroUrl, setInsureHeroUrl] = useState(settings.insure_hero_img || "");
    const [insPartner1, setInsPartner1] = useState(settings.insure_partner1_img || "");
    const [insPartner2, setInsPartner2] = useState(settings.insure_partner2_img || "");
    const [insPartner3, setInsPartner3] = useState(settings.insure_partner3_img || "");
    const [insPartner4, setInsPartner4] = useState(settings.insure_partner4_img || "");
    const [insureP1Url, setInsureP1Url] = useState(settings.insure_partner1_img || "");
    const [insureP2Url, setInsureP2Url] = useState(settings.insure_partner2_img || "");
    const [insureP3Url, setInsureP3Url] = useState(settings.insure_partner3_img || "");
    const [insureP4Url, setInsureP4Url] = useState(settings.insure_partner4_img || "");

    const [paymentsHeroUrl, setPaymentsHeroUrl] = useState(settings.payments_hero_img || "");
    const [payBillsUrl, setPayBillsUrl] = useState(settings.support_paybills_img || "");
    const [payP2PUrl, setPayP2PUrl] = useState(settings.support_p2p_img || "");
    const [payWiresUrl, setPayWiresUrl] = useState(settings.support_wires_img || "");

    // --- 4. COMPANY & RESOURCES ---
    const [aboutHeroUrl, setAboutHeroUrl] = useState(settings.about_hero_img || "");
    const [learnHeroUrl, setLearnHeroUrl] = useState(settings.learn_hero_img || "");
    const [art1Url, setArt1Url] = useState(settings.learn_art1_img || "");
    const [art2Url, setArt2Url] = useState(settings.learn_art2_img || "");
    const [art3Url, setArt3Url] = useState(settings.learn_art3_img || "");
    const [securityHeroUrl, setSecurityHeroUrl] = useState(settings.security_hero_img || "");
    const [supportHeroUrl, setSupportHeroUrl] = useState(settings.support_hero_img || "");
    const [careersHeroUrl, setCareersHeroUrl] = useState(settings.careers_hero_img || "");
    const [pressHeroUrl, setPressHeroUrl] = useState(settings.press_hero_img || "");
    const [investHeroUrl, setInvestHeroUrl] = useState(settings.invest_hero_img || "");
    const [RatesHeroURL, setRatesHeroURL] = useState(settings.rates_hero_img || "");

    // --- 5. SYSTEM ---
    const [logoUrl, setLogoUrl] = useState(settings.site_logo || "");
    const [jsonMenu, setJsonMenu] = useState(
        settings.nav_structure_json
            ? settings.nav_structure_json
            : JSON.stringify(MEGA_MENUS, null, 2)
    );

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsPending(true);
        const formData = new FormData(event.currentTarget);
        const result = await updateSiteSettings(formData);

        if (result.success) {
            toast.success("Settings Saved Successfully");
            router.refresh();
        } else {
            toast.error("Failed to save settings.");
        }
        setIsPending(false);
    }

    // Helper to render class for active tab
    const getTabClass = (name: string) => `${styles.tabBtn} ${activeTab === name ? styles.activeTab : ''}`;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>System Configuration</h1>
                <p className={styles.subtitle}>Manage website content, product details, and system settings.</p>
            </header>

            {/* --- TABS NAVIGATION --- */}
            <div className={styles.tabs}>
                {/* 1. MAIN */}
                <button type="button" onClick={() => setActiveTab('home')} className={getTabClass('home')}><Home size={16} /> Home</button>

                {/* 2. PRODUCTS  */}
                <div className={styles.separator} />
                <button type="button" onClick={() => setActiveTab('banking')} className={getTabClass('banking')}><Landmark size={16} /> Banking</button>
                <button type="button" onClick={() => setActiveTab('save')} className={getTabClass('save')}><PiggyBank size={16} /> Save</button>
                <button type="button" onClick={() => setActiveTab('borrow')} className={getTabClass('borrow')}><HandCoins size={16} /> Lending</button>
                <button type="button" onClick={() => setActiveTab('wealth')} className={getTabClass('wealth')}><Gem size={16} /> Wealth</button>
                <button type="button" onClick={() => setActiveTab('crypto')} className={getTabClass('crypto')}><Bitcoin size={16} /> Crypto</button>
                <button type="button" onClick={() => setActiveTab('insure')} className={getTabClass('insure')}><ShieldCheck size={16} /> Insurance</button>
                <button type="button" onClick={() => setActiveTab('payments')} className={getTabClass('payments')}><ArrowRightLeft size={16} /> Payments</button>

                {/* 3. UTILITIES & RESOURCES */}
                <div className={styles.separator} />
                <button type="button" onClick={() => setActiveTab('rates')} className={getTabClass('rates')}><Percent size={16} /> Rates</button>
                <button type="button" onClick={() => setActiveTab('locations')} className={getTabClass('locations')}><MapPin size={16} /> Locations</button>
                <button type="button" onClick={() => setActiveTab('learn')} className={getTabClass('learn')}><BookOpen size={16} /> Learn</button>

                {/* 4. COMPANY & SUPPORT */}
                <div className={styles.separator} />
                <button type="button" onClick={() => setActiveTab('about')} className={getTabClass('about')}><Users size={16} /> About</button>
                <button type="button" onClick={() => setActiveTab('jobs')} className={getTabClass('jobs')}><Briefcase size={16} /> Careers</button>
                <button type="button" onClick={() => setActiveTab('investors')} className={getTabClass('investors')}><LineChart size={16} /> Investors</button>
                <button type="button" onClick={() => setActiveTab('press')} className={getTabClass('press')}><FileText size={16} /> Press</button>
                <button type="button" onClick={() => setActiveTab('support')} className={getTabClass('support')}><Headset size={16} /> Support</button>
                <button type="button" onClick={() => setActiveTab('faq')} className={getTabClass('faq')}><HelpCircle size={16} /> FAQ</button>
                <button type="button" onClick={() => setActiveTab('security')} className={getTabClass('security')}><Shield size={16} /> Security</button>
                <button type="button" onClick={() => setActiveTab('legal')} className={getTabClass('legal')}><Scale size={16} /> Legal</button>

                {/* 5. SYSTEM */}
                <div className={styles.separator} />
                <button type="button" onClick={() => setActiveTab('nav')} className={getTabClass('nav')}><Menu size={16} /> Navigation</button>
                <button type="button" onClick={() => setActiveTab('footer')} className={getTabClass('footer')}><FileText size={16} /> Footer</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.card}>

                {/* --- 1. HOME --- */}
                {activeTab === 'home' && (
                    <HomeTab
                        settings={settings}
                        logoUrl={logoUrl} setLogoUrl={setLogoUrl}
                        heroUrl={heroUrl} setHeroUrl={setHeroUrl}
                        homeCardUrl={homeCardUrl} setHomeCardUrl={setHomeCardUrl}
                        homeCtaUrl={homeCtaUrl} setHomeCtaUrl={setHomeCtaUrl}
                        guide1Url={guide1Url} setGuide1Url={setGuide1Url}
                        guide3Url={guide3Url} setGuide3Url={setGuide3Url}
                        guide4Url={guide4Url} setGuide4Url={setGuide4Url}
                        loan1Url={loan1Url} setLoan1Url={setLoan1Url}
                        loan2Url={loan2Url} setLoan2Url={setLoan2Url}
                        investUrl={investUrl} setInvestUrl={setInvestUrl}
                        globalMapUrl={globalMapUrl} setGlobalMapUrl={setGlobalMapUrl}
                        partner1={partner1} setPartner1={setPartner1}
                        partner2={partner2} setPartner2={setPartner2}
                        partner3={partner3} setPartner3={setPartner3}
                        partner4={partner4} setPartner4={setPartner4}
                        partner5={partner5} setPartner5={setPartner5}
                        partner6={partner6} setPartner6={setPartner6}
                    />
                )}

                {/* --- 2. PRODUCTS --- */}
                {activeTab === 'banking' && (
                    <BankingTab
                        settings={settings}
                        bankHeroUrl={bankHeroUrl} setBankHeroUrl={setBankHeroUrl}
                        bankCSUrl={bankCSUrl} setBankCSUrl={setBankCSUrl}
                        bankBizUrl={bankBizUrl} setBankBizUrl={setBankBizUrl}
                        bankStuUrl={bankStuUrl} setBankStuUrl={setBankStuUrl}
                    />
                )}

                {activeTab === 'save' && (
                    <SaveTab
                        settings={settings}
                        saveHeroUrl={saveHeroUrl} setSaveHeroUrl={setSaveHeroUrl}
                        saveCdsUrl={saveCdsUrl} setSaveCdsUrl={setSaveCdsUrl}
                        saveMmaUrl={saveMmaUrl} setSaveMmaUrl={setSaveMmaUrl}
                        saveKidsUrl={saveKidsUrl} setSaveKidsUrl={setSaveKidsUrl}
                    />
                )}

                {activeTab === 'borrow' && (
                    <BorrowTab
                        settings={settings}
                        borrowHeroUrl={borrowHeroUrl} setBorrowHeroUrl={setBorrowHeroUrl}
                        borrowCCUrl={borrowCCUrl} setBorrowCCUrl={setBorrowCCUrl}
                        borrowPLUrl={borrowPLUrl} setBorrowPLUrl={setBorrowPLUrl}
                        borrowMTUrl={borrowMTUrl} setBorrowMTUrl={setBorrowMTUrl}
                        borrowALUrl={borrowALUrl} setBorrowALUrl={setBorrowALUrl}
                        borrowSLUrl={borrowSLUrl} setBorrowSLUrl={setBorrowSLUrl}
                        borrowHeUrl={borrowHEUrl} setBorrowHeUrl={setBorrowHEUrl}
                    />
                )}

                {activeTab === 'wealth' && (
                    <WealthTab
                        settings={settings}
                        wealthHeroUrl={wealthHeroUrl} setWealthHeroUrl={setWealthHeroUrl}
                        wealthPcgUrl={wealthPcgUrl} setWealthPcgUrl={setWealthPcgUrl}
                        wealthRetUrl={wealthRetUrl} setWealthRetUrl={setWealthRetUrl}
                        wealthEstUrl={wealthEstUrl} setWealthEstUrl={setWealthEstUrl}
                    />
                )}

                {activeTab === 'crypto' && (
                    <CryptoTab
                        settings={settings}
                        cryptoHeroUrl={cryptoHeroUrl} setCryptoHeroUrl={setCryptoHeroUrl}
                    />
                )}

                {activeTab === 'insure' && (
                    <InsureTab
                        settings={settings}
                        insureHeroUrl={insureHeroUrl} setInsureHeroUrl={setInsureHeroUrl}
                        partner1={insPartner1} setPartner1={setInsPartner1}
                        partner2={insPartner2} setPartner2={setInsPartner2}
                        partner3={insPartner3} setPartner3={setInsPartner3}
                        partner4={insPartner4} setPartner4={setInsPartner4}
                        insureP1Url={insureP1Url} setInsureP1Url={setInsureP1Url}
                        insureP2Url={insureP2Url} setInsureP2Url={setInsureP2Url}
                        insureP3Url={insureP3Url} setInsureP3Url={setInsureP3Url}
                        insureP4Url={insureP4Url} setInsureP4Url={setInsureP4Url}
                    />
                )}

                {activeTab === 'payments' && (
                    <PaymentsTab
                        settings={settings}
                        paymentsHeroUrl={paymentsHeroUrl} setPaymentsHeroUrl={setPaymentsHeroUrl}
                        payBillsUrl={payBillsUrl} setPayBillsUrl={setPayBillsUrl}
                        payP2PUrl={payP2PUrl} setPayP2PUrl={setPayP2PUrl}
                        payWiresUrl={payWiresUrl} setPayWiresUrl={setPayWiresUrl}
                    />
                )}

                {/* --- 3. UTILITIES --- */}
                {activeTab === 'rates' && (
                    <RatesTab
                        settings={settings}
                        RatesHeroURL={RatesHeroURL} setRatesHeroURL={setRatesHeroURL}
                    />
                )}

                {activeTab === 'locations' && <LocationsTab settings={settings} />}

                {activeTab === 'learn' && (
                    <LearnTab
                        settings={settings}
                        learnHeroUrl={learnHeroUrl} setLearnHeroUrl={setLearnHeroUrl}
                        art1Url={art1Url} setArt1Url={setArt1Url}
                        art2Url={art2Url} setArt2Url={setArt2Url}
                        art3Url={art3Url} setArt3Url={setArt3Url}
                    />
                )}

                {/* --- 4. COMPANY & SUPPORT --- */}
                {activeTab === 'about' && (
                    <AboutTab
                        settings={settings}
                        aboutHeroUrl={aboutHeroUrl} setAboutHeroUrl={setAboutHeroUrl}
                    />
                )}

                {activeTab === 'jobs' && (
                    <JobsTab
                        settings={settings}
                        careersHeroUrl={careersHeroUrl} setCareersHeroUrl={setCareersHeroUrl}
                    />
                )}

                {activeTab === 'investors' && (
                    <InvestorsTab
                        settings={settings}
                        investHeroUrl={investHeroUrl} setInvestHeroUrl={setInvestHeroUrl}
                    />
                )}

                {activeTab === 'press' && (
                    <PressTab
                        settings={settings}
                        pressHeroUrl={pressHeroUrl} setPressHeroUrl={setPressHeroUrl}
                    />
                )}

                {activeTab === 'support' && (
                    <SupportTab
                        settings={settings}
                        supportHeroUrl={supportHeroUrl}
                        setSupportHeroUrl={setSupportHeroUrl}
                    />
                )}

                {activeTab === 'faq' && <FaqTab settings={settings} />}

                {activeTab === 'security' && (
                    <SecurityTab
                        settings={settings}
                        securityHeroUrl={securityHeroUrl}
                        setSecurityHeroUrl={setSecurityHeroUrl}
                    />
                )}

                {activeTab === 'legal' && <LegalTab settings={settings} />}

                {/* --- 5. SYSTEM --- */}
                {activeTab === 'nav' && (
                    <NavTab settings={settings} jsonMenu={jsonMenu} setJsonMenu={setJsonMenu} />
                )}

                {activeTab === 'footer' && (
                    <FooterTab settings={settings} footerLinks={footerLinks} />
                )}

                {/* --- ACTIONS --- */}
                <div className={styles.actions}>
                    <button type="submit" disabled={isPending} className={styles.saveBtn}>
                        {isPending ? <Loader2 className={styles.spin} size={20} /> : <Save size={20} />} Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}