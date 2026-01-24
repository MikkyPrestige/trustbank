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

interface FaqListProps {
    faqs: FaqItem[];
}

// Optional: Helper to get icons based on category
const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
        case 'security': return <Shield size={18} className={styles.catIcon} />;
        case 'transfers': return <RefreshCw size={18} className={styles.catIcon} />;
        case 'account & cards': return <CreditCard size={18} className={styles.catIcon} />;
        default: return <HelpCircle size={18} className={styles.catIcon} />;
    }
};

export default function FaqList({ faqs }: FaqListProps) {
    // 1. Change state to track ID instead of Index (better for grouped lists)
    const [openId, setOpenId] = useState<string | null>(null);

    const toggleFAQ = (id: string) => {
        setOpenId(openId === id ? null : id);
    };

    // 2. Group FAQs by Category
    const groupedFaqs = faqs.reduce((groups, faq) => {
        const category = faq.category || 'General';
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(faq);
        return groups;
    }, {} as Record<string, FaqItem[]>);

    const sortOrder = ['Transfers', 'Security', 'Account & Cards', 'General'];

    // Sort the keys based on our preferred order
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
            <h2 className={styles.sectionTitle}>Frequently Asked</h2>

            {sortedCategories.map((category) => (
                <div key={category} className={styles.categoryGroup}>
                    {/* Category Header */}
                    <div className={styles.catHeader}>
                        {getCategoryIcon(category)}
                        <span>{category}</span>
                    </div>

                    {/* Questions in this category */}
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