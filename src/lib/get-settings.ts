import { db } from "@/lib/db";
import { cache } from "react";

// The Complete List of Tracked Settings
export const DEFAULT_SETTINGS = {
    // --- BRANDING ---
    site_name: "TrustBank",
    site_logo: "/logo.png",

    // --- CONTACT ---
    contact_email: "support@trustbank.com",
    contact_phone: "+1 (555) 123-4567",
    address_main: "123 Finance Street, New York, NY",

    // --- HOME PAGE HERO ---
    hero_title: "Banking for the Future",
    hero_subtitle: "Secure, fast, and reliable banking solutions for everyone.",
    hero_cta_text: "Get Started",
    announcement_active: "false",
    announcement_text: "⚠️ System Maintenance scheduled for Sunday at 2 AM.",

    // --- HOME SECTIONS ---
    home_rates_title: "Current Market Rates",
    home_rates_desc: "Competitive rates designed to help you grow faster and borrow smarter.",
    home_card_series: "THE ONYX SERIES",
    home_card_title: "One Card.",
    home_card_highlight: "Infinite Possibilities.",
    home_card_desc: "Experience the power of the TrustBank Onyx Visa®.",
    home_card_feat_1: "No Foreign Fees",
    home_card_feat_2: "Purchase Protection",
    home_card_feat_3: "Instant Rewards",
    home_guide_title: "Financial Guidance & Support",
    home_guide_desc: "Expert insights and tools to help you achieve your goals.",
    guide_article_1_title: "Secure your next chapter",
    guide_article_2_title: "Fraud & Scam Alert",
    guide_article_3_title: "Buying a Home?",
    guide_article_4_title: "How Rising Rates Impact Business",
    home_invest_title: "Invest in your future.",
    home_invest_highlight: "On your terms.",
    home_invest_desc: "Build a diversified portfolio with Stocks, ETFs, and Crypto.",
    home_loan_title: "Borrow with Confidence",
    home_loan_desc: "Transparent terms for mortgages, autos, and personal loans.",
    home_global_title: "Banking Without",
    home_global_highlight: "Borders.",
    home_global_desc: "Your money moves with you. Zero foreign transaction fees.",
    global_stat_countries: "180+",
    global_stat_digital: "100%",
    global_stat_fraud: "24/7",
    home_partner_label: "Trusted by industry leaders",
    home_cta_title: "Stop just banking. Start building.",
    home_cta_desc: "Join over 2 million members who have upgraded their financial life.",
    home_cta_benefit_1: "No hidden fees",
    home_cta_benefit_2: "FDIC Insured up to $250k",
    home_cta_benefit_3: "Get paid 2 days early",

    // --- NAVBAR PROMOS  ---
    nav_bank_title: "",
    nav_bank_desc: "",
    nav_wealth_title: "",
    nav_wealth_desc: "",

    // --- PRODUCT PAGES ---
    // Bank
    bank_hero_title_1: "Banking at the",
    bank_hero_highlight: "speed of life.",
    bank_hero_desc: "Get paid up to 2 days early, enjoy fee-free overdrafts.",
    bank_card_badge: "Titanium Design",
    bank_card_title: "The card that turns heads.",
    bank_card_desc: "Milled from a single sheet of aerospace-grade metal.",
    bank_feat_1_title: "Early Payday",
    bank_feat_1_desc: "Direct deposits land up to 2 days faster.",
    bank_feat_2_title: "Instant Alerts",
    bank_feat_2_desc: "Real-time notifications for every transaction.",
    bank_feat_3_title: "Fee-Free Travel",
    bank_feat_3_desc: "Spend globally with zero hidden fees.",
    bank_compare_title: "Stop paying to hold your own money.",
    bank_compare_desc: "We believe banking should be free, simple, and transparent.",

    // Save
    save_hero_title: "Grow your wealth with",
    save_hero_highlight: "unshakable security.",
    save_hero_desc: "TrustBank gives you industry-leading rates to get there faster.",

    // Borrow
    borrow_hero_title: "Fuel your dreams with",
    borrow_hero_highlight: "smart capital.",
    borrow_hero_desc: "Get the money you need with terms that actually make sense.",
    borrow_stat_funded: "$2B+",
    borrow_stat_speed: "24h",
    borrow_stat_approval: "98%",
    rate_home_equity_label: "Low Fixed Rates",
    rate_mortgage_label: "Custom Quotes",
    rate_student_label: "Variable & Fixed",

    // Wealth
    wealth_hero_title: "Preserve your legacy.",
    wealth_hero_highlight: "Architect your future.",
    wealth_hero_desc: "Comprehensive wealth management for those who demand more.",
    wealth_advisor_title: "Partner with a Fiduciary.",
    wealth_advisor_desc: "TrustBank advisors are legally bound to act in your best interest.",

    // Insure
    insure_hero_title: "Prepared for the",
    insure_hero_highlight: "unexpected.",
    insure_hero_desc: "Protection that actually pays out when you need it.",
    insure_products_title: "Coverage Solutions",
    insure_products_desc: "A full suite of insurance products.",
    insure_partners_title: "Backed by the world's strongest carriers",

    // Payments
    payments_hero_title: "Move money at the",
    payments_hero_highlight: "speed of thought.",
    payments_hero_desc: "Experience the next generation of seamless payments.",
    payments_widget_title: "Global Transfer Engine",
    payments_widget_desc: "Send money internationally with zero hidden fees.",
    payments_widget_fee_label: "Transfer Fee",
    payments_widget_fee_value: "$0.00 (Free)",
    payments_methods_title: "Ways to Pay",
    payments_methods_desc: "Flexible options for every transaction type.",

    // Learn
    learn_hero_title: "Financial clarity",
    learn_hero_highlight: "starts here.",
    learn_hero_desc: "Expert insights to help you make smarter decisions.",
    learn_pulse_title: "Financial Wellness Pulse",
    learn_pulse_desc: "Rate your confidence (1-10).",
    learn_insights_title: "Latest Insights",
    learn_insights_desc: "Curated knowledge for your journey.",

    // Crypto
    crypto_hero_title: "The future of money",
    crypto_hero_highlight: "is already here.",
    crypto_hero_desc: "Buy, sell, and hold top digital assets directly.",

    // Rates Page
    rates_hero_title: "Transparent rates.",
    rates_hero_highlight: "Real returns.",
    rates_hero_desc: "We believe in keeping more money in your pocket.",

    // --- GLOBAL RATES ---
    rate_hysa_apy: "4.50",
    rate_cd_apy: "5.10",
    rate_mma_apy: "4.25",
    rate_kids_apy: "3.00",
    rate_business_apy: "2.50",
    rate_ira_apy: "7.00",
    rate_personal_apr: "6.99",
    rate_auto_apr: "4.50",
    rate_credit_intro_apr: "0",
    rate_mortgage_30yr: "6.12",
    rate_auto_low: "5.89",
    rate_checking_bonus: "200",

    // --- DASHBOARD SETTINGS ---
    dashboard_alert_show: "false",
    dashboard_alert_type: "info",
    dashboard_alert_msg: "Scheduled maintenance: Services will be unavailable Sunday 2 AM - 4 AM EST.",
    dashboard_promo_title: "Make your money work harder",
    dashboard_promo_desc: "Open a High Yield Savings account today.",
    dashboard_promo_btn: "Start Saving",
    dashboard_promo_link: "/dashboard",
    dashboard_support_phone: "+1 (555) 000-HELP",
    dashboard_support_email: "vip@trustbank.com",
};

export const getSiteSettings = cache(async () => {
    try {
        const storedSettings = await db.systemSettings.findMany();

        const settingsMap = storedSettings.reduce((acc: Record<string, string>, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        return { ...DEFAULT_SETTINGS, ...settingsMap };
    } catch (error) {
        console.error("Failed to fetch settings, using defaults", error);
        return DEFAULT_SETTINGS;
    }
});