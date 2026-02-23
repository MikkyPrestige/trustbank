'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ChevronRight, ChevronDown, LogOut, User, LayoutDashboard, TrendingUp, MapPin, Globe, Phone } from "lucide-react";
import { signOut } from 'next-auth/react';
import styles from "./Navbar.module.css";

interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: () => void;
    onRegister: () => void;
    menus: any;
    settings: any;
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    } | null;
}

const ROUTE_MAP: Record<string, string> = {
    BANKING: '/bank',
    LENDING: '/borrow',
    WEALTH: '/wealth',
    INSURANCE: '/insure',
    RESOURCES: '/learn',
};

export default function MobileDrawer({ isOpen, onClose, onLogin, onRegister, menus, settings, user }: MobileDrawerProps) {
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

    const toggleAccordion = (key: string) => {
        setExpandedMenu(expandedMenu === key ? null : key);
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const lang = e.target.value;
        const googleSelect = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (googleSelect) {
            googleSelect.value = lang;
            googleSelect.dispatchEvent(new Event('change'));
        }
    };

    const displayName = user?.name?.split(' ')[0] ?? 'Member';

    return (
        <>
            <div className={`${styles.mobileBackdrop} ${isOpen ? styles.mobileBackdropOpen : ''}`} onClick={onClose} />
            <div className={`${styles.mobileDrawer} ${isOpen ? styles.mobileDrawerOpen : ''}`}>
                <div className={styles.drawerHeader}>
                    <span className={styles.drawerTitle}>Menu</span>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.drawerContent}>
                    <nav className={styles.mobileNavLinks}>
                        {/* 1. DASHBOARD */}
                        {user && (
                            <>
                                <Link href={settings.nav_dashboard_link} className={styles.mobileLink} onClick={onClose}>
                                    <div className={styles.linkContent}>
                                        <LayoutDashboard size={20} />
                                        <span>{settings.nav_dashboard_label}</span>
                                    </div>
                                    <ChevronRight size={18} />
                                </Link>
                                <div className={styles.drawerDivider} />
                            </>
                        )}

                        {/* 2. DYNAMIC CMS MENUS */}
                        {Object.keys(menus).map((key) => {
                            const isExpanded = expandedMenu === key;
                            return (
                                <div key={key} className={styles.accordionGroup}>
                                    <div className={`${styles.mobileLinkWrapper} ${isExpanded ? styles.activeLinkWrapper : ''}`}>
                                        <Link href={ROUTE_MAP[key]} className={styles.mobileLinkText} onClick={onClose}>
                                            {menus[key].title}
                                        </Link>
                                        <button className={styles.mobileToggleBtn} onClick={() => toggleAccordion(key)}>
                                            <ChevronDown size={20} className={isExpanded ? styles.rotateIcon : ''} />
                                        </button>
                                    </div>

                                    <div className={`${styles.mobilesubs} ${isExpanded ? styles.showsubs : ''}`}>
                                        {menus[key].links?.flat().map((link: any, idx: number) => (
                                            <Link key={idx} href={link.href} className={styles.sub} onClick={onClose}>
                                                {link.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {/* <div className={styles.drawerDivider} /> */}

                        {/* 3. CMS INTEGRATED UTILITY LINKS */}
                        <div className={styles.UtilsNav}>
                            <div className={styles.UtilsContent}>
                                <Link href={settings.nav_rates_link} className={styles.mobileLink} onClick={onClose}>
                                    <div className={styles.linkContent}>
                                        <TrendingUp size={20} />
                                        <span>{settings?.nav_rates_label}</span>
                                    </div>
                                    <ChevronRight size={18} />
                                </Link>
                            </div>

                            <div className={styles.UtilsContent}>
                                <Link href={settings.nav_locations_link} className={styles.mobileLink} onClick={onClose}>
                                    <div className={styles.linkContent}>
                                        <MapPin size={20} />
                                        <span>{settings.nav_locations_label}</span>
                                    </div>
                                    <ChevronRight size={18} />
                                </Link>
                            </div>

                            {/* SUPPORT PHONE */}
                            {settings.contact_phone && (
                                <a href={`tel:${settings.contact_phone}`} className={styles.mobileLink}>
                                    <div className={styles.linkContent}>
                                        <Phone size={20} />
                                        <span>{settings.contact_phone}</span>
                                    </div>
                                </a>
                            )}
                        </div>

                        <div className={styles.mobileLangRow}>
                            <Globe size={20} />
                            <select onChange={handleLanguageChange} className={styles.mobileNativeSelect}>
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                                <option value="zh-CN">Chinese</option>
                                <option value="ar">Arabic</option>
                            </select>
                        </div>
                    </nav>
                </div>

                {/* USER PROFILE SECTION */}
                {user && (
                    <div className={styles.mobileUserCard}>
                        <div className={styles.avatarWrapper}>
                            {user.image ? (
                                <Image src={user.image} alt={user.name || "User"} width={44} height={44} className={styles.avatarImg} />
                            ) : (
                                <div className={styles.avatarPlaceholder}>
                                    <User size={24} />
                                </div>
                            )}
                        </div>
                        <div className={styles.userDetails}>
                            <p className={styles.userName}>{displayName}</p>
                            <p className={styles.userEmail}>{user.email}</p>
                        </div>
                    </div>
                )}

                {/* FOOTER ACTIONS */}
                <div className={styles.drawerFooter}>
                    {!user ? (
                        <div className={styles.authGrid}>
                            <button className={styles.drawerLoginBtn} onClick={onLogin}>
                                {settings.nav_login_label}
                            </button>
                            <button className={styles.drawerOpenBtn} onClick={onRegister}>
                                {settings.nav_register_label}
                            </button>
                        </div>
                    ) : (
                        <button className={styles.mobileLogoutBtn} onClick={() => signOut({ callbackUrl: '/' })}>
                            <LogOut size={20} /> {settings.nav_logout_label}
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}