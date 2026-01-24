import Link from 'next/link';
import { ArrowLeft, Calendar, ShieldCheck, Scale } from 'lucide-react';
import styles from './legal.module.css';

interface LegalPageProps {
    title: string;
    lastUpdated: Date;
    content: string;
    type: 'privacy' | 'terms';
}

export default function LegalPageLayout({ title, lastUpdated, content, type }: LegalPageProps) {
    const Icon = type === 'privacy' ? ShieldCheck : Scale;

    return (
        <div className={styles.pageWrapper}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.container}>
                    <Link href="/" className={styles.backLink}>
                        <ArrowLeft size={16} /> Back to Home
                    </Link>
                    <div className={styles.titleWrapper}>
                        <div className={styles.iconBox}>
                            <Icon size={32} />
                        </div>
                        <div>
                            <h1 className={styles.title}>{title}</h1>
                            <div className={styles.meta}>
                                <Calendar size={14} />
                                <span>Last Updated: {lastUpdated.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                        </div>
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
                        This document is legally binding. If you have questions, please contact our
                        <Link href="/help" className={styles.link}> compliance team</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}