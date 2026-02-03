'use client';

import { useState } from "react";
import { restoreUser, deleteUserPermanently } from "@/actions/admin/archive-actions";
import { Trash2, RotateCcw, Loader2 } from "lucide-react";
import styles from "./users.module.css";

export default function ArchiveActions({ userId }: { userId: string }) {
    const [loading, setLoading] = useState<'RESTORE' | 'DELETE' | null>(null);

    const handleRestore = async () => {
        if (!confirm("Restore this user to the Active list?")) return;
        setLoading('RESTORE');
        const res = await restoreUser(userId);
        if (!res.success) alert(res.message);
        setLoading(null);
    };

    const handleDelete = async () => {
        const warning = "⚠️ FINAL WARNING ⚠️\n\nThis will PERMANENTLY ERASE this user and all their data.\nThis cannot be undone.\n\nAre you sure?";
        if (!confirm(warning)) return;

        setLoading('DELETE');
        const res = await deleteUserPermanently(userId);
        if (!res.success) alert(res.message);
        setLoading(null);
    };

    return (
        <div className={styles.flexGap}>
            {/*  Restore Button */}
            <button
                onClick={handleRestore}
                disabled={!!loading}
                className={styles.restoreBtn}
                title="Restore User"
            >
                {loading === 'RESTORE' ? <Loader2 size={16} className={styles.spin} /> : <RotateCcw size={16} />}
            </button>

            {/*  Delete Button */}
            <button
                onClick={handleDelete}
                disabled={!!loading}
                className={styles.deleteBtn}
                title="Delete Forever"
            >
                {loading === 'DELETE' ? <Loader2 size={16} className={styles.spin} /> : <Trash2 size={16} />}
            </button>
        </div>
    );
}