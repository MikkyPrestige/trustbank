'use client';

import { adminIssueCard } from '@/actions/admin';
import { useState } from 'react';
import styles from '../users.module.css';
import { Plus, Loader2 } from 'lucide-react';

export default function IssueCardButton({ userId }: { userId: string }) {
    const [loading, setLoading] = useState(false);

    const handleIssue = async () => {
        if (!confirm("Issue a new Virtual Visa Card for this user?")) return;
        setLoading(true);
        await adminIssueCard(userId);
        setLoading(false);
    };

    return (
        <button onClick={handleIssue} disabled={loading} className={styles.issueBtn}>
            {loading ? <Loader2 className={styles.spin} size={16} /> : <Plus size={16} />}
            Issue New Card
        </button>
    );
}