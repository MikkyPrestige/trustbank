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

                                    <div className={`${styles.mobilesubLinks} ${isExpanded ? styles.showsubLinks : ''}`}>
                                        {menus[key].links?.flat().map((link: any, idx: number) => (
                                            <Link key={idx} href={link.href} className={styles.sub} onClick={onClose}>
                                                {link.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        <div className={styles.UtilsNav}>
                            {settings.contact_phone && (
                                <a href={`tel:${settings.contact_phone}`} className={styles.mobileSupportLink}>
                                    <div className={styles.supportIconWrapper}>
                                        <Phone size={20} />
                                    </div>
                                    <div className={styles.supportTextWrapper}>
                                        <span className={styles.supportLabel}>Customer Support</span>
                                        <span className={styles.supportNumber}>{settings.contact_phone}</span>
                                    </div>
                                    <ChevronRight size={18} className={styles.supportArrow} />
                                </a>
                            )}
                        </div>

                        <div className={styles.mobileLangCard}>
                            <div className={styles.langIconWrapper}>
                                <Globe size={20} />
                            </div>
                            <div className={styles.langTextWrapper}>
                                <span className={styles.langLabel}>Language</span>
                                <span className={styles.currentLang}>English</span>
                            </div>
                            <select
                            onChange={handleLanguageChange}
                            className={styles.hiddenSelectFull}
                            aria-label="Select Language"
                            >
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                                <option value="zh-CN">Chinese</option>
                                <option value="ar">Arabic</option>
                            </select>
                            <ChevronDown size={18} className={styles.supportArrow} />
                        </div>
                    </nav>
                </div>

                {user && (
                    <div className={styles.mobileUserCard}>
                        <div className={styles.mobileAvatarWrapper}>
                            {user.image ? (
                                <Image src={user.image} alt={user.name || "User"} width={44} height={44} className={styles.mobileAvatarImg} />
                            ) : (
                                    <div className={styles.mobileAvatarPlaceholder}>
                                    <User size={24} />
                                </div>
                            )}
                        </div>
                        <div className={styles.mobileUserDetails}>
                            <p className={styles.mobileUserName}>{displayName}</p>
                            <p className={styles.mobileUserEmail}>{user.email}</p>
                        </div>
                    </div>
                )}

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