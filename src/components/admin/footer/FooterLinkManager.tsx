'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { createFooterLink, updateFooterLink, updateFooterOrder, deleteFooterLink } from "@/actions/admin/footer-links";
import { Trash2, Plus, Edit2, X, Save, GripVertical } from "lucide-react";
import toast from "react-hot-toast";
import styles from "./footer-manager.module.css";

interface LinkItem {
    id: string;
    label: string;
    href: string;
    column: string;
    order: number;
}

export default function FooterLinkManager({ initialLinks }: { initialLinks: LinkItem[] }) {
    const router = useRouter();
    const [links, setLinks] = useState<LinkItem[]>(initialLinks);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [order, setOrder] = useState<number>(0);

    // Form States
    const [label, setLabel] = useState("");
    const [href, setHref] = useState("");
    const [column, setColumn] = useState("col1");
    const [loading, setLoading] = useState(false);

    useEffect(() => { setLinks(initialLinks); }, [initialLinks]);

    // Switch to Edit Mode
    const startEdit = (link: LinkItem & { order?: number }) => {
        setEditingId(link.id);
        setLabel(link.label);
        setHref(link.href);
        setColumn(link.column);
        setOrder(link.order || 0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Cancel Edit
    const cancelEdit = () => {
        setEditingId(null);
        setLabel("");
        setHref("");
        setColumn("col1");
        setOrder(0);
    };


    const handleSave = async () => {
        if (!label || !href) return toast.error("Label and URL required");

        setLoading(true);
        const formData = new FormData();
        formData.append("label", label);
        formData.append("href", href);
        formData.append("column", column);
        formData.append("order", order.toString());

        let res;
        if (editingId) {
            res = await updateFooterLink(editingId, formData);
        } else {
            res = await createFooterLink(formData);
        }

        if (res.success) {
            toast.success(editingId ? "Link updated" : "Link added");
            cancelEdit();
            router.refresh();
        } else {
            toast.error(res.message || "Operation failed");
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
            handleSave();
        }
    };

    const onDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        // 1. Create new array locally
        const items = Array.from(links);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // 2. Map new index
        const updatedLinks = items.map((item, index) => ({
            ...item,
            order: index,
        }));

        setLinks(updatedLinks);

        const orderData = updatedLinks.map(link => ({
            id: link.id,
            order: link.order
        }));

        // 4. Send mapping to server
        toast.promise(updateFooterOrder(orderData), {
            loading: 'Saving positions...',
            success: 'Order synced to database!',
            error: 'Database update failed.'
        });
    };

    return (
        <div className={styles.container}>
            <div className={`${styles.formRow} ${editingId ? styles.editingHighlight : ''}`}>
                <select value={column} onChange={e => setColumn(e.target.value)} className={styles.select}>
                    <option value="col1">Column 1 (Services)</option>
                    <option value="col2">Column 2 (Quick Links)</option>
                    <option value="legal">Bottom Strip (Legal)</option>
                </select>

                <input
                    placeholder="Label"
                    value={label}
                    onChange={e => setLabel(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={styles.input}
                />

                <input
                    placeholder="Link"
                    value={href}
                    onChange={e => setHref(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={styles.input}
                />

                <input
                    type="number"
                    placeholder="Order"
                    value={order}
                    onChange={e => setOrder(parseInt(e.target.value) || 0)}
                    className={styles.orderInput}
                    title="Display Order (lower numbers show first)"
                />

                <div className={styles.buttonGroup}>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={loading}
                        className={editingId ? styles.saveBtn : styles.addBtn}
                    >
                        {editingId ?
                            <><Save size={16} /> Update</> : <><Plus size={16} /> Add</>
                        }
                    </button>

                    {editingId && (
                        <button
                            type="button"
                            onClick={cancelEdit}
                            className={styles.cancelBtn}
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Links List */}
            <div className={styles.list}>
                {links.length === 0 ? (
                    <p className={styles.emptyState}>No dynamic links added yet.</p>
                ) :
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="links">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className={styles.list}
                                >
                                    {links.map((link, index) => (
                                        <Draggable key={link.id} draggableId={link.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`${styles.item} ${snapshot.isDragging ? styles.dragging : ''}`}
                                                >
                                                    <div className={styles.itemContent}>
                                                        {/* DRAG HANDLE */}
                                                        <div {...provided.dragHandleProps} className={styles.dragHandle}>
                                                            <GripVertical size={18} />
                                                        </div>

                                                        <span className={styles.itemOrderBadge}>#{index}</span>
                                                        <span className={styles.columnBadge}>{link.column}</span>
                                                        <span className={styles.linkLabel}>{link.label}</span>
                                                        <span className={styles.linkUrl}>{link.href}</span>
                                                    </div>

                                                    <div className={styles.actions}>
                                                        <button type="button" onClick={() => startEdit(link)} className={styles.editBtn}>
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button type="button" onClick={() => handleDelete(link.id)} className={styles.deleteBtn}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                }
            </div>
        </div>
    );
}