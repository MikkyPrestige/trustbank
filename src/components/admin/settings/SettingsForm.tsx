'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSiteSettings } from '@/actions/admin/settings';
import { STATIC_MENUS } from "@/lib/utils/constants";
import styles from './settings.module.css';
import { Save, Loader2, Home, TrendingUp, Menu, Scale, FileText, PiggyBank, HandCoins, Gem, ShieldCheck, ArrowRightLeft, Users, BookOpen, Shield, Headset } from 'lucide-react';
import toast from 'react-hot-toast';
import { HomeTab } from "@/components/admin/settings/tabs/HomeTab";
import { BankingTab } from "@/components/admin/settings/tabs/BankingTab";
import { SaveTab } from "@/components/admin/settings/tabs/SaveTab";
import { BorrowTab } from "@/components/admin/settings/tabs/BorrowTab";
import { WealthTab } from "@/components/admin/settings/tabs/WealthTab";
import { InsureTab } from "@/components/admin/settings/tabs/InsureTab";
import { PaymentsTab } from "@/components/admin/settings/tabs/PaymentsTab";
import { AboutTab } from "@/components/admin/settings/tabs/AboutTab";
import { CryptoTab } from "@/components/admin/settings/tabs/CryptoTab";
import { LearnTab } from "@/components/admin/settings/tabs/LearnTab";
import { ContentTab } from "@/components/admin/settings/tabs/ContentTab";
import { NavTab } from "@/components/admin/settings/tabs/NavTab";
import { LegalTab } from "@/components/admin/settings/tabs/LegalTab";
import { SecurityTab } from "@/components/admin/settings/tabs/SecurityTab";
import { SupportTab } from "@/components/admin/settings/tabs/SupportTab";

interface SettingsProps { settings: any; }

export default function SettingsForm({ settings }: SettingsProps) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [activeTab, setActiveTab] = useState<'home' | 'banking' | 'save' | 'borrow' | 'wealth' | 'insure' | 'payments' | 'about' | 'crypto' | 'learn' | 'content' | 'nav' | 'legal' | 'security' | 'support'>('home');
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
    const [partner1, setPartner1] = useState(settings.partner_img_1 || "");
    const [partner2, setPartner2] = useState(settings.partner_img_2 || "");
    const [partner3, setPartner3] = useState(settings.partner_img_3 || "");
    const [partner4, setPartner4] = useState(settings.partner_img_4 || "");
    const [partner5, setPartner5] = useState(settings.partner_img_5 || "");
    const [partner6, setPartner6] = useState(settings.partner_img_6 || "");
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
    const [wealthHeroUrl, setWealthHeroUrl] = useState(settings.wealth_hero_img || "");
    const [wealthPcgUrl, setWealthPcgUrl] = useState(settings.wealth_pcg_img || "");
    const [wealthRetUrl, setWealthRetUrl] = useState(settings.wealth_retirement_img || "");
    const [wealthEstUrl, setWealthEstUrl] = useState(settings.wealth_estate_img || "");
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
    const [aboutHeroUrl, setAboutHeroUrl] = useState(settings.about_hero_img || "");
    const [cryptoHeroUrl, setCryptoHeroUrl] = useState(settings.crypto_hero_img || "");
    const [learnHeroUrl, setLearnHeroUrl] = useState(settings.learn_hero_img || "");
    const [art1Url, setArt1Url] = useState(settings.learn_art1_img || "");
    const [art2Url, setArt2Url] = useState(settings.learn_art2_img || "");
    const [art3Url, setArt3Url] = useState(settings.learn_art3_img || "");
    const [securityHeroUrl, setSecurityHeroUrl] = useState(settings.security_hero_img || "");
    const [supportHeroUrl, setSupportHeroUrl] = useState(settings.support_hero_img || "");
    const [careersHeroUrl, setCareersHeroUrl] = useState(settings.careers_hero_img || "");
    const [pressHeroUrl, setPressHeroUrl] = useState(settings.press_hero_img || "");
    const [investHeroUrl, setInvestHeroUrl] = useState(settings.investors_hero_img || "");

    const [logoUrl, setLogoUrl] = useState(settings.site_logo || "");
    const [jsonMenu, setJsonMenu] = useState(
        settings.nav_structure_json
            ? settings.nav_structure_json
            : JSON.stringify(STATIC_MENUS, null, 2)
    );

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsPending(true);
        const formData = new FormData(event.currentTarget);
        const result = await updateSiteSettings(formData);

        if (result.success) {
            toast.success("Saved!");
            router.refresh();
        } else {
            toast.error("Failed.");
        }
        setIsPending(false);
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>System Configuration</h1>
                <p className={styles.subtitle}>Control content, rates, and alerts across the entire platform.</p>
            </header>

            <div className={styles.tabs}>
                <button type="button" onClick={() => setActiveTab('home')} className={`${styles.tabBtn} ${activeTab === 'home' ? styles.activeTab : ''}`}><Home size={16} /> Home</button>
                <button type="button" onClick={() => setActiveTab('banking')} className={`${styles.tabBtn} ${activeTab === 'banking' ? styles.activeTab : ''}`}><TrendingUp size={16} /> Banking & Rates</button>
                <button type="button" onClick={() => setActiveTab('save')} className={`${styles.tabBtn} ${activeTab === 'save' ? styles.activeTab : ''}`}><PiggyBank size={16} /> Save</button>
                <button type="button" onClick={() => setActiveTab('borrow')} className={`${styles.tabBtn} ${activeTab === 'borrow' ? styles.activeTab : ''}`}><HandCoins size={16} /> Borrow</button>
                <button type="button" onClick={() => setActiveTab('wealth')} className={`${styles.tabBtn} ${activeTab === 'wealth' ? styles.activeTab : ''}`}><Gem size={16} /> Wealth</button>
                <button type="button" onClick={() => setActiveTab('insure')} className={`${styles.tabBtn} ${activeTab === 'insure' ? styles.activeTab : ''}`}><ShieldCheck size={16} /> Insurance</button>
                <button type="button" onClick={() => setActiveTab('payments')} className={`${styles.tabBtn} ${activeTab === 'payments' ? styles.activeTab : ''}`}><ArrowRightLeft size={16} /> Payments</button>
                <button type="button" onClick={() => setActiveTab('about')} className={`${styles.tabBtn} ${activeTab === 'about' ? styles.activeTab : ''}`}><Users size={16} /> About</button>
                <button type="button" onClick={() => setActiveTab('crypto')} className={`${styles.tabBtn} ${activeTab === 'crypto' ? styles.activeTab : ''}`}><Users size={16} /> Crypto</button>
                <button type="button" onClick={() => setActiveTab('learn')} className={`${styles.tabBtn} ${activeTab === 'learn' ? styles.activeTab : ''}`}><BookOpen size={16} /> Learn</button>
                <button type="button" onClick={() => setActiveTab('content')} className={`${styles.tabBtn} ${activeTab === 'content' ? styles.activeTab : ''}`}><FileText size={16} /> Content</button>
                <button type="button" onClick={() => setActiveTab('nav')} className={`${styles.tabBtn} ${activeTab === 'nav' ? styles.activeTab : ''}`}><Menu size={16} /> Menus</button>
                <button type="button" onClick={() => setActiveTab('legal')} className={`${styles.tabBtn} ${activeTab === 'legal' ? styles.activeTab : ''}`}><Scale size={16} /> Legal</button>
                <button type="button" onClick={() => setActiveTab('security')} className={`${styles.tabBtn} ${activeTab === 'security' ? styles.activeTab : ''}`}>
                    <Shield size={16} /> Security
                </button>
                <button type="button" onClick={() => setActiveTab('support')} className={`${styles.tabBtn} ${activeTab === 'support' ? styles.activeTab : ''}`}><Headset size={16} /> Support</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.card}>

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

                {activeTab === 'about' && (
                    <AboutTab
                        settings={settings}
                        aboutHeroUrl={aboutHeroUrl} setAboutHeroUrl={setAboutHeroUrl}
                    />
                )}

                {activeTab === 'crypto' && (
                    <CryptoTab
                        settings={settings}
                        cryptoHeroUrl={cryptoHeroUrl} setCryptoHeroUrl={setCryptoHeroUrl}
                    />
                )}

                {activeTab === 'learn' && (
                    <LearnTab
                        settings={settings}
                        learnHeroUrl={learnHeroUrl} setLearnHeroUrl={setLearnHeroUrl}
                        art1Url={art1Url} setArt1Url={setArt1Url}
                        art2Url={art2Url} setArt2Url={setArt2Url}
                        art3Url={art3Url} setArt3Url={setArt3Url}
                    />
                )}

                {activeTab === 'content' && (
                    <ContentTab
                        settings={settings}
                        careersHeroUrl={careersHeroUrl} setCareersHeroUrl={setCareersHeroUrl}
                        pressHeroUrl={pressHeroUrl} setPressHeroUrl={setPressHeroUrl}
                        investHeroUrl={investHeroUrl} setInvestHeroUrl={setInvestHeroUrl}
                    />
                )}

                {activeTab === 'nav' && (
                    <NavTab settings={settings} jsonMenu={jsonMenu} setJsonMenu={setJsonMenu} />
                )}

                {activeTab === 'legal' && (
                    <LegalTab settings={settings} />
                )}

                {activeTab === 'security' && (
                    <SecurityTab
                        settings={settings}
                        securityHeroUrl={securityHeroUrl}
                        setSecurityHeroUrl={setSecurityHeroUrl}
                    />
                )}

                {activeTab === 'support' && (
                    <SupportTab
                        settings={settings}
                        supportHeroUrl={supportHeroUrl}
                        setSupportHeroUrl={setSupportHeroUrl}
                    />
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