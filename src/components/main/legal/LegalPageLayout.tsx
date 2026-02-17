import Link from 'next/link';
import { ArrowLeft, Calendar, ShieldCheck, Scale, Accessibility } from 'lucide-react';
import styles from './legal.module.css';

interface LegalPageProps {
    title: string;
    lastUpdated: Date | null;
    content: string;
    navConfig: Record<string, { label: string; href: string; id: string }>;
    type: 'privacy' | 'terms' | 'accessibility';
    backText: string;
    backUrl: string;
    footerText: string;
    linkText: string;
    linkUrl: string;
    updatedLabel: string;
}

export default function LegalPageLayout({
    title,
    lastUpdated,
    content,
    navConfig,
    type,
    backText,
    backUrl,
    footerText,
    linkText,
    linkUrl,
    updatedLabel,
}: LegalPageProps) {

    // 1. Icon Mapping
    const Icon = {
        privacy: ShieldCheck,
        terms: Scale,
        accessibility: Accessibility,
    }[type];

    // 2. Navigation Configuration
    const navItems = Object.values(navConfig);

    // 3. Date Formatter Helper
    const formatDate = (date: Date | null) => {
        if (!date) return 'Recently';
        return date.toLocaleDateString("en-US", {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.header}>
                <div className={styles.container}>
                    <Link href={backUrl} className={styles.backLink}>
                        <ArrowLeft size={16} /> {backText}
                    </Link>

                    <div className={styles.titleWrapper}>
                        <div className={styles.iconBox}>
                            <Icon size={32} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h1 className={styles.title}>{title}</h1>
                            <div className={styles.meta}>
                                <Calendar size={14} />
                                <span>
                                    {updatedLabel} {formatDate(lastUpdated)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
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

            {/* Document Body */}
            <div className={styles.container}>
                <div className={styles.documentCard}>
                    <div
                        className={styles.prose}
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </div>

                {/* Smart Footer - */}
                {(footerText || linkText) && (
                    <div className={styles.footerNote}>
                        <p>
                            {footerText}{' '}
                            {linkUrl && (
                                <Link href={linkUrl} className={styles.link}>
                                    {linkText}
                                </Link>
                            )}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}