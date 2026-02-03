'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createFooterLink, deleteFooterLink } from "@/actions/admin/footer-links";
import { Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import styles from "./footer-manager.module.css";

interface LinkItem {
    id: string;
    label: string;
    href: string;
    column: string;
}

export default function FooterLinkManager({ initialLinks }: { initialLinks: LinkItem[] }) {
    const router = useRouter();
    const [links, setLinks] = useState<LinkItem[]>(initialLinks);

    useEffect(() => {
        setLinks(initialLinks);
    }, [initialLinks]);

    // Form States
    const [label, setLabel] = useState("");
    const [href, setHref] = useState("");
    const [column, setColumn] = useState("col1");
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        if (!label || !href) return toast.error("Label and URL required");

        setLoading(true);
        const formData = new FormData();
        formData.append("label", label);
        formData.append("href", href);
        formData.append("column", column);

        const res = await createFooterLink(formData);
        if (res.success) {
            toast.success("Link added");
            setLabel("");
            setHref("");
            router.refresh();
        } else {
            toast.error("Error adding link");
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this link?")) return;

        const res = await deleteFooterLink(id);
        if (res.success) {
            toast.success("Deleted");
            setLinks(prev => prev.filter(l => l.id !== id));
            router.refresh();
        } else {
            toast.error("Failed to delete");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formRow}>
                <select
                    value={column}
                    onChange={e => setColumn(e.target.value)}
                    className={styles.select}
                >
                    <option value="col1">Column 1 (Services)</option>
                    <option value="col2">Column 2 (Quick Links)</option>
                    <option value="legal">Bottom Strip (Legal)</option>
                </select>

                <input
                    placeholder="Label (e.g. Careers)"
                    value={label}
                    onChange={e => setLabel(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={styles.input}
                />

                <input
                    placeholder="URL (e.g. /careers)"
                    value={href}
                    onChange={e => setHref(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={styles.input}
                />

                <button
                    type="button"
                    onClick={handleAdd}
                    disabled={loading}
                    className={styles.addBtn}
                >
                    <Plus size={16} /> Add
                </button>
            </div>

            {/* Links List */}
            <div className={styles.list}>
                {links.length === 0 ? (
                    <p className={styles.emptyState}>No dynamic links added yet.</p>
                ) : (
                    links.map(link => (
                        <div key={link.id} className={styles.item}>
                            <div className={styles.itemContent}>
                                <span className={styles.columnBadge}>{link.column}</span>
                                <span className={styles.linkLabel}>{link.label}</span>
                                <span className={styles.linkUrl}>{link.href}</span>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleDelete(link.id)}
                                className={styles.deleteBtn}
                                title="Delete Link"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}