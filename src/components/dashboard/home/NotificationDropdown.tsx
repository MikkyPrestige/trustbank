"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Bell, Info, AlertTriangle, CheckCircle, CheckCheck } from "lucide-react";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "@/actions/user/notifications";
import styles from "./styles/notifications.module.css";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    link: string | null;
    createdAt: Date;
}

export default function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const previousCountRef = useRef(0);
    const isFirstLoadRef = useRef(true);

    const playSound = () => {
        const audio = new Audio('/sound/notification.mp3');
        audio.play().catch(() => { });
    };

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const data = await getNotifications();

                if (Array.isArray(data)) {
                    setNotifications(data);
                    setLoading(false);

                    const unreadCount = data.filter((n: Notification) => !n.isRead).length;
                    const prevCount = previousCountRef.current;

                    if (!isFirstLoadRef.current && unreadCount > prevCount) {
                        playSound();
                    }
                    previousCountRef.current = unreadCount;
                    isFirstLoadRef.current = false;
                } else {
                    setNotifications([]);
                    setLoading(false);
                }
            } catch (err) {
                setLoading(false);
            }
        };

        fetchNotes();
        const interval = setInterval(fetchNotes, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDismiss = async (id: string, link: string | null) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        await markNotificationRead(id);
    };

    const handleMarkAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        await markAllNotificationsRead();
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getIcon = (type: string) => {
        if (type === 'ERROR') return <AlertTriangle size={16} color="var(--danger)" />;
        if (type === 'SUCCESS') return <CheckCircle size={16} color="var(--success)" />;
        return <Info size={16} color="var(--primary)" />;
    };

    function timeAgo(dateString: Date) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;

        return date.toLocaleDateString();
    }

    return (
        <div className={styles.wrapper} ref={dropdownRef}>
            <button
                className={`${styles.bellBtn} ${isOpen ? styles.active : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={18} />
                {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <span className={styles.title}>Notifications</span>

                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead} className={styles.markAllBtn} title="Mark all as read">
                                <CheckCheck size={14} /> Mark all read
                            </button>
                        )}
                    </div>

                    <div className={styles.list}>
                        {loading ? (
                            <div className={styles.empty}>Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className={styles.empty}>
                                    <Bell size={32} className={styles.emptyBell} />
                                <p>No notifications</p>
                            </div>
                        ) : (
                            notifications.map(note => (
                                <div key={note.id} className={`${styles.item} ${!note.isRead ? styles.unread : ''}`}>
                                    <div className={styles.iconCol}>{getIcon(note.type)}</div>

                                    <div className={styles.contentCol}>
                                        <p className={styles.noteTitle}>{note.title}</p>
                                        <p className={styles.noteMsg}>{note.message}</p>

                                        <div className={styles.actionsRow}>
                                            {note.link && (
                                                <Link
                                                    href={note.link}
                                                    className={styles.actionLink}
                                                    onClick={() => {
                                                        setIsOpen(false);
                                                        handleDismiss(note.id, note.link);
                                                    }}
                                                >
                                                    View Detail
                                                </Link>
                                            )}

                                            <button
                                                className={styles.dismissBtn}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDismiss(note.id, null);
                                                }}
                                            >
                                                Dismiss
                                            </button>
                                        </div>

                                        <span className={styles.noteTime}>
                                            {timeAgo(note.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}