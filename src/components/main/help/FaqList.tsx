'use client';

import { useState } from 'react';
import { ChevronDown, Shield, RefreshCw, CreditCard, HelpCircle } from 'lucide-react';
import styles from './help.module.css';

interface FaqItem {
    id: string;
    question: string;
    answer: string;
    category: string;
}

const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
        case 'security': return <Shield size={18} className={styles.catIcon} />;
        case 'transfers': return <RefreshCw size={18} className={styles.catIcon} />;
        case 'account & cards': return <CreditCard size={18} className={styles.catIcon} />;
        default: return <HelpCircle size={18} className={styles.catIcon} />;
    }
};

export default function FaqList({ faqs, settings }: { faqs: FaqItem[], settings: any }) {
    const [openId, setOpenId] = useState<string | null>(null);

    const toggleFAQ = (id: string) => {
        setOpenId(openId === id ? null : id);
    };

    const groupedFaqs = faqs.reduce((groups, faq) => {
        const category = faq.category || 'General';
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(faq);
        return groups;
    }, {} as Record<string, FaqItem[]>);

    const sortOrder = ['Transfers', 'Security', 'Account & Cards', 'General'];

    const sortedCategories = Object.keys(groupedFaqs).sort((a, b) => {
        const indexA = sortOrder.indexOf(a);
        const indexB = sortOrder.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
    });

    return (
        <div className={styles.faqSection}>
            <h2 className={styles.sectionTitle}>{settings.help_faq_title}</h2>
            {sortedCategories.map((category) => (
                <div key={category} className={styles.categoryGroup}>
                    <div className={styles.catHeader}>
                        {getCategoryIcon(category)}
                        <span>{category}</span>
                    </div>

                    <div className={styles.groupList}>
                        {groupedFaqs[category].map((faq) => (
                            <div key={faq.id} className={styles.faqItem}>
                                <button
                                    className={styles.faqQuestion}
                                    onClick={() => toggleFAQ(faq.id)}
                                >
                                    <h3>{faq.question}</h3>
                                    <ChevronDown
                                        className={`${styles.chevron} ${openId === faq.id ? styles.chevronOpen : ''}`}
                                        size={20}
                                    />
                                </button>
                                <div className={`${styles.faqAnswer} ${openId === faq.id ? styles.faqAnswerOpen : ''}`}>
                                    <p>{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}