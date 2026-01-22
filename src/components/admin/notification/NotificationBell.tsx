'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead } from '@/actions/admin/notification';
import styles from './NotificationBell.module.css';
import Link from 'next/link';

type Notification = {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    link: string | null;
    createdAt: Date;
};

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Sound & Tracking Refs
    const previousCountRef = useRef(0);
    const isFirstLoadRef = useRef(true);

    // 1. Sound Logic
    const playSound = () => {
        const audio = new Audio('/sound/notification.mp3');
        audio.play().catch(() => { });
    };

    // 2. Fetch & Poll
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const data = await getNotifications();
                setNotifications(data);
                setLoading(false);

                const unreadCount = data.filter((n: Notification) => !n.isRead).length;
                const prevCount = previousCountRef.current;

                // Play sound if new unread messages arrive (skip on first load)
                if (!isFirstLoadRef.current && unreadCount > prevCount) {
                    playSound();
                }

                previousCountRef.current = unreadCount;
                isFirstLoadRef.current = false;
            } catch (err) {
                // Silent fail
            }
        };

        fetchNotes();
        const interval = setInterval(fetchNotes, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    // 3. Click Outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 4. Actions

    // Dismiss: Removes from list view immediately
    const handleDismiss = async (id: string, link: string | null) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        await markAsRead(id);
    };

    // Mark All Read: Keeps in list, removes badges
    const handleMarkAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        await markAllAsRead();
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Helper for Icons
    const getIcon = (type: string) => {
        const t = type.toUpperCase();
        if (t === 'ERROR' || t === 'CRITICAL') return <AlertTriangle size={16} color="#ef4444" />;
        if (t === 'SUCCESS') return <CheckCircle size={16} color="#22c55e" />;
        return <Info size={16} color="#3b82f6" />;
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
            {/* BELL BUTTON */}
            <button
                className={`${styles.bellButton} ${isOpen ? styles.active : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className={styles.badge}>{unreadCount}</span>
                )}
            </button>

            {/* DROPDOWN */}
            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <span className={styles.title}>Notifications</span>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead} className={styles.headerBtn} title="Mark all as read">
                                <CheckCheck size={14} /> Mark all read
                            </button>
                        )}
                    </div>

                    <div className={styles.list}>
                        {loading ? (
                            <div className={styles.empty}>Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className={styles.empty}>
                                <Bell size={32} style={{ opacity: 0.2, marginBottom: '10px' }} />
                                <p>No new notifications</p>
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
                                                    View Details →
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