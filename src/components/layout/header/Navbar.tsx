'use client';

import Script from 'next/script';
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { signOut } from 'next-auth/react';
import { Lock, Menu, ChevronDown, MapPin, Globe, TrendingUp, Phone, LayoutDashboard, User, LogOut } from "lucide-react";
import DesktopMenu from "./DesktopMenu";
import MobileDrawer from "./MobileDrawer";
import LoginModal from "@/components/auth/login/LoginModal";
import RegisterModal from "@/components/auth/register/RegisterModal";
import styles from "./Navbar.module.css";

interface NavbarProps {
    settings: any;
    menus: any;
    topNav?: Array<{ label: string; href: string; icon?: string }>;
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    } | null;
}

declare global {
    interface Window {
        google: any;
        googleTranslateElementInit: () => void;
    }
}

export default function Navbar({ settings, menus, topNav, user }: NavbarProps) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Google Translate Logic
    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const lang = e.target.value;
        const googleSelect = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (googleSelect) {
            googleSelect.value = lang;
            googleSelect.dispatchEvent(new Event('change'));
        }
    };

    useEffect(() => {
        const shouldLock = isMobileOpen || isLoginOpen || isRegisterOpen;
        document.body.style.overflow = shouldLock ? 'hidden' : 'unset';
    }, [isMobileOpen, isLoginOpen, isRegisterOpen]);

    useEffect(() => {
        if (!isProfileOpen) return;
        const closeDropdown = () => setIsProfileOpen(false);
        window.addEventListener('click', closeDropdown);
        return () => window.removeEventListener('click', closeDropdown);
    }, [isProfileOpen]);

    const openLogin = () => { setIsMobileOpen(false); setIsLoginOpen(true); };
    const openRegister = () => { setIsMobileOpen(false); setIsRegisterOpen(true); };
    const switchToRegister = () => { setIsLoginOpen(false); setIsRegisterOpen(true); };
    const switchToLogin = () => { setIsRegisterOpen(false); setIsLoginOpen(true); };

    const displayName = user?.name?.split(' ')[0] ?? 'Member';

    return (
        <>
            <Script
                src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
                strategy="afterInteractive"
                onLoad={() => {
                    window.googleTranslateElementInit = () => {
                        new window.google.translate.TranslateElement({
                            pageLanguage: 'en',
                            autoDisplay: false,
                        }, 'google_translate_element');
                    };
                }}
            />

            <header className={styles.header}>
                <div className={styles.topBar}>
                    <div className={styles.container}>
                        <Link href="/" className={styles.logoWrapper}>
                            <Image
                                src={settings.site_logo}
                                alt={settings.site_logo_alt}
                                width={150} height={40}
                                className={styles.logoImage}
                                priority
                            />
                        </Link>

                        <div className={styles.topActions}>
                            {topNav?.map((item, idx) => (
                                <Link key={idx} href={item.href} className={styles.topLink}>
                                    {item.label === "Rates" && <TrendingUp size={16} className={styles.linkIcon} />}
                                    {item.label === "Locations" && <MapPin size={16} className={styles.linkIcon} />}
                                    {item.label}
                                </Link>
                            ))}

                            {/* SUPPORT PHONE */}
                            {settings.contact_phone && (
                                <a href={`tel:${settings.contact_phone}`} className={styles.mobileLink}>
                                    <div className={styles.linkContent}>
                                        <Phone size={20} />
                                        <span>{settings.contact_phone}</span>
                                    </div>
                                </a>
                            )}

                            {/* Translator */}
                            <div className={styles.langSelector}>
                                <Globe size={16} />
                                <select onChange={handleLanguageChange} className={styles.nativeSelect}>
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                    <option value="de">German</option>
                                    <option value="zh-CN">Chinese</option>
                                    <option value="ar">Arabic</option>
                                </select>
                                <div id="google_translate_element" style={{ display: 'none' }}></div>
                            </div>

                            {user ? (
                                <div className={styles.profileContainer} onClick={(e) => e.stopPropagation()}>
                                    <button
                                        className={styles.profileTrigger}
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    >
                                        <div className={styles.avatarWrapper}>
                                            {user.image ? (
                                                <Image src={user.image} alt={user.name || "User"} width={32} height={32} className={styles.avatarImg} />
                                            ) : (
                                                    <div className={styles.avatarPlaceholder}>
                                                        <User size={24} />
                                                    </div>
                                            )}
                                        </div>
                                        <span className={styles.userName}>{displayName}</span>
                                        <ChevronDown size={14} className={isProfileOpen ? styles.rotate : ''} />
                                    </button>

                                    {isProfileOpen && (
                                        <div className={styles.profileDropdown}>
                                            <div className={styles.dropdownHeader}>
                                                <p className={styles.dropName}>{displayName}</p>
                                                <p className={styles.dropEmail}>{user.email}</p>
                                            </div>
                                            <hr className={styles.divider} />
                                            <Link href={settings.nav_dashboard_link} className={styles.dropItem} onClick={() => setIsProfileOpen(false)}>
                                                <LayoutDashboard size={16} /> {settings.nav_dashboard_label}
                                            </Link>
                                            <button
                                                onClick={() => signOut({ callbackUrl: '/' })}
                                                className={`${styles.dropItem} ${styles.logoutBtn}`}
                                            >
                                                <LogOut size={16} /> {settings.nav_logout_label}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <button className={styles.openBtn} onClick={() => setIsRegisterOpen(true)}>
                                        {settings.nav_register_label}
                                    </button>
                                    <button className={styles.loginBtn} onClick={() => setIsLoginOpen(true)}>
                                        {settings.nav_login_label} <Lock size={16} />
                                    </button>
                                </>
                            )}
                        </div>

                        <button className={styles.mobileToggle} onClick={() => setIsMobileOpen(true)}>
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
                <DesktopMenu menus={menus} />
            </header>

            <MobileDrawer
                isOpen={isMobileOpen}
                onClose={() => setIsMobileOpen(false)}
                onLogin={openLogin}
                onRegister={openRegister}
                user={user}
                menus={menus}
                settings={settings}
            />

            <RegisterModal isOpen={isRegisterOpen} onSwitchToLogin={switchToLogin} onClose={() => setIsRegisterOpen(false)} siteName={settings.site_name} />
            <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSwitchToRegister={switchToRegister} siteName={settings.site_name} />
        </>
    );
}
