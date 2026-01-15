'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Search, CreditCard, ShieldAlert, Lock, RefreshCw,
    ChevronDown, Phone, MessageSquare
} from 'lucide-react';
import styles from './help.module.css';

// FAQ Data
const FAQS = [
    {
        q: "How do I reset my online banking password?",
        a: "For security, automated resets are disabled. Please visit the 'Forgot Password' page and follow the instructions to verify your identity with our security team."
    },
    {
        q: "What are the fees for international transfers?",
        a: "TrustBank Enterprise clients enjoy $0 fees on all international wire transfers. Currency exchange rates are locked at the time of transfer."
    },
    {
        q: "How do I report a lost or stolen card?",
        a: "You can instantly freeze your card in the Mobile App under 'Card Controls'. To request a replacement, click the 'Lost Card' quick action above."
    },
    {
        q: "Can I use my card while traveling abroad?",
        a: "Yes. Your card works globally with no foreign transaction fees. We recommend setting a 'Travel Notice' in your dashboard to prevent fraud alerts."
    }
];

export default function HelpPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>

            {/* 1. HERO SEARCH */}
            <section className={styles.hero}>
                <div className={styles.heroMesh}></div>
                <h1 className={styles.title}>How can we help you?</h1>
                <p className={styles.subtitle}>Search for topics, features, or troubleshooting guides.</p>

                <div className={styles.searchWrapper}>
                    <div className={styles.searchInputWrapper}>
                        <Search className={styles.searchIcon} size={20} />
                        <input
                            type="text"
                            placeholder="e.g. 'Routing number' or 'Wire limit'"
                            className={styles.searchInput}
                        />
                    </div>
                </div>
            </section>

            {/* 2. MAIN CONTENT */}
            <div className={styles.container}>

                {/* QUICK ACTIONS */}
                <h2 className={styles.sectionTitle}>Quick Actions</h2>
                <div className={styles.quickGrid}>
                    <Link href="/login" className={styles.actionCard}>
                        <div className={styles.cardIcon}><Lock size={24} /></div>
                        <div>
                            <h3>Reset Password</h3>
                            <p>Recover access to your account.</p>
                        </div>
                    </Link>
                    <Link href="#" className={styles.actionCard}>
                        <div className={styles.cardIcon}><CreditCard size={24} /></div>
                        <div>
                            <h3>Lost Card</h3>
                            <p>Freeze card and order replacement.</p>
                        </div>
                    </Link>
                    <Link href="#" className={styles.actionCard}>
                        <div className={styles.cardIcon}><ShieldAlert size={24} /></div>
                        <div>
                            <h3>Report Fraud</h3>
                            <p>Dispute an unrecognized charge.</p>
                        </div>
                    </Link>
                    <Link href="/bank" className={styles.actionCard}>
                        <div className={styles.cardIcon}><RefreshCw size={24} /></div>
                        <div>
                            <h3>Routing Number</h3>
                            <p>Find details for direct deposit.</p>
                        </div>
                    </Link>
                </div>

                {/* FAQ SECTION */}
                <div className={styles.faqSection}>
                    <h2 className={styles.sectionTitle}>Frequently Asked</h2>

                    {FAQS.map((faq, i) => (
                        <div key={i} className={styles.faqItem}>
                            <button
                                className={styles.faqQuestion}
                                onClick={() => toggleFAQ(i)}
                            >
                                <h3>{faq.q}</h3>
                                <ChevronDown
                                    className={`${styles.chevron} ${openIndex === i ? styles.chevronOpen : ''}`}
                                    size={20}
                                />
                            </button>
                            <div className={`${styles.faqAnswer} ${openIndex === i ? styles.faqAnswerOpen : ''}`}>
                                {faq.a}
                            </div>
                        </div>
                    ))}
                </div>

                {/* CONTACT FOOTER */}
                <div className={styles.contactStrip}>
                    <h2>Still need help?</h2>
                    <p>Our concierge support team is available 24/7 for Enterprise clients.</p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a href="tel:1-800-TRUST" className={styles.contactBtn}>
                            <Phone size={18} /> Call Support
                        </a>
                        <a href="#" className={styles.contactBtn} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)' }}>
                            <MessageSquare size={18} /> Live Chat
                        </a>
                    </div>
                </div>

            </div>
        </div>
    );
}