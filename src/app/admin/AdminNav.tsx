'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    LayoutDashboard,
    Users,
    FileCheck,
    Globe,
    Banknote,
    Activity,
    ShieldAlert,
    LogOut,
    IdCard,
    MessageSquareText,
    Settings,
    Lock,
    Server,
    AlertTriangle,
    Menu,
    X
} from 'lucide-react';
import styles from './admin.module.css';

interface AdminNavProps {
    role?: string;
    logoUrl?: string;
    siteName?: string;
    ticketUnreadCount?: number;
}

export default function AdminNav({ role, logoUrl, siteName, ticketUnreadCount = 0 }: AdminNavProps) {
    const [isOpen, setIsOpen] = useState(false);
    const close = () => setIsOpen(false);

    const logoSrc = logoUrl || '/logo.png';
    const title = siteName || 'TrustBank';

    const exitLink = (
        <Link href="/dashboard" className={styles.exitLink} onClick={close}>
            <LogOut size={16} /> Exit Console
        </Link>
    );

    return (
        <>
            {/* Mobile top bar */}
            <div className={styles.mobileBar}>
                <Link href="/dashboard" className={styles.mobileLogo}>
                    <Image src={logoSrc} alt={title} width={100} height={28} className={styles.brandLogo} />
                    <span className={styles.brandBadge}>ADMIN</span>
                </Link>
                <div className={styles.mobileBarRight}>
                    <Link href="/dashboard" className={styles.mobileExitBtn}>
                        <LogOut size={16} /> Exit
                    </Link>
                    <button className={styles.hamburger} onClick={() => setIsOpen(true)} aria-label="Open menu">
                        <Menu size={22} />
                    </button>
                </div>
            </div>

            {/* Overlay */}
            {isOpen && <div className={styles.drawerOverlay} onClick={close} />}

            {/* Sidebar / Drawer */}
            <nav className={`${styles.nav} ${isOpen ? styles.drawerOpen : ''}`}>
                <div className={styles.brand}>
                    <Image src={logoSrc} alt={title} width={120} height={32} className={styles.brandLogo} />
                    <span className={styles.brandBadge}>ADMIN</span>
                    <button className={styles.drawerClose} onClick={close} aria-label="Close menu">
                        <X size={18} />
                    </button>
                </div>

                <div className={styles.navLinks}>
                    <Link href="/admin" className={styles.navLink} onClick={close}>
                        <LayoutDashboard size={18} /> Overview
                    </Link>

                    <div className={styles.separator} />

                    {role === 'SUPER_ADMIN' && (
                        <Link href="/admin/staff" className={styles.navLink} onClick={close}>
                            <IdCard size={18} /> Staff
                        </Link>
                    )}
                    <Link href="/admin/users" className={styles.navLink} onClick={close}>
                        <Users size={18} /> Users
                    </Link>
                    <Link href="/admin/verifications" className={styles.navLink} onClick={close}>
                        <FileCheck size={18} /> KYC
                    </Link>

                    <div className={styles.separator} />

                    <Link href="/admin/wires" className={styles.navLink} onClick={close}>
                        <Globe size={18} /> Wires
                    </Link>
                    <Link href="/admin/loans" className={styles.navLink} onClick={close}>
                        <Banknote size={18} /> Loans
                    </Link>

                    <div className={styles.separator} />

                    <Link href="/admin/support" className={styles.navLink} onClick={close}>
                        <MessageSquareText size={18} /> Tickets
                        {ticketUnreadCount > 0 && (
                            <span className={styles.navBadge}>{ticketUnreadCount}</span>
                        )}
                    </Link>
                    <Link href="/admin/generator" className={styles.navLink} onClick={close}>
                        <Activity size={18} /> TXNs
                    </Link>
                    <Link href="/admin/settings" className={styles.navLink} onClick={close}>
                        <Settings size={18} /> Site Settings
                    </Link>

                    {role === 'SUPER_ADMIN' && (
                        <>
                            <div className={styles.separator} />
                            <Link href="/admin/system" className={styles.navLink} onClick={close}>
                                <Server size={18} /> System Rules
                            </Link>
                            <Link href="/admin/security" className={styles.navLink} onClick={close}>
                                <Lock size={18} /> Security
                            </Link>
                            <Link href="/admin/logs/security" className={styles.navLink} onClick={close}>
                                <AlertTriangle size={18} /> Security Logs
                            </Link>
                            <Link href="/admin/logs/audit" className={styles.navLink} onClick={close}>
                                <ShieldAlert size={18} /> Audit Logs
                            </Link>
                        </>
                    )}
                </div>

                <div className={styles.navExit}>
                    {exitLink}
                </div>
            </nav>
        </>
    );
}
