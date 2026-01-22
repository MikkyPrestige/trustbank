'use client';

import { adminIssueCard } from '@/actions/admin/users';
import { useState } from 'react';
import styles from './users.module.css';
import { Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function IssueCardButton({ userId }: { userId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleIssue = async () => {
        if (!confirm("Issue a new Virtual Visa Card for this user?")) return;

        setLoading(true);
        try {
            const res = await adminIssueCard(userId);
            if (res.success) {
                toast.success("Card issued successfully");
                router.refresh();
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Failed to issue card");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button onClick={handleIssue} disabled={loading} className={styles.issueBtn}>
            {loading ? <Loader2 className={styles.spin} size={16} /> : <Plus size={16} />}
            Issue New Card
        </button>
    );
}