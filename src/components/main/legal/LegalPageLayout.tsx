import Link from 'next/link';
import { ArrowLeft, Calendar, ShieldCheck, Scale } from 'lucide-react';
import styles from './legal.module.css';

interface LegalPageProps {
    title: string;
    lastUpdated: Date;
    content: string;
    type: 'privacy' | 'terms' | 'accessibility';
    backText: string;
    footerText: string;
    linkText: string;
    linkUrl: string;
    updatedLabel: string;
}

export default function LegalPageLayout({ title, lastUpdated, content, type, backText, footerText, linkText, linkUrl, updatedLabel }: LegalPageProps) {
    // 1. Dynamic Icon Logic
    const Icon = type === 'privacy' ? ShieldCheck : Scale;

    // 2. Navigation Items Configuration
    const navItems = [
        { label: 'Privacy Policy', href: '/privacy', id: 'privacy' },
        { label: 'Terms of Use', href: '/terms', id: 'terms' },
        { label: 'Accessibility', href: '/accessibility', id: 'accessibility' },
    ];

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.header}>
                <div className={styles.container}>
                    <Link href="/" className={styles.backLink}>
                        <ArrowLeft size={16} /> {backText}
                    </Link>

                    <div className={styles.titleWrapper}>
                        <div className={styles.iconBox}>
                            <Icon size={32} />
                        </div>
                        <div>
                            <h1 className={styles.title}>{title}</h1>
                            <div className={styles.meta}>
                                <Calendar size={14} />
                                <span>{updatedLabel} {lastUpdated.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>

                    {/* --- NEW: LEGAL TABS NAVIGATION --- */}
                    <div className={styles.tabsContainer}>
                        {navItems.map((item) => (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={`${styles.tab} ${type === item.id ? styles.activeTab : ''}`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className={styles.container}>
                <div className={styles.documentCard}>
                    <div
                        className={styles.prose}
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </div>

                <div className={styles.footerNote}>
                    <p>
                        {footerText}
                        <Link href={linkUrl} className={styles.link}> {linkText}</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}