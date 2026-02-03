'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Lock, Menu, Globe, ChevronDown, MapPin, TrendingUp } from "lucide-react";
import styles from "./Navbar.module.css";

// Sub-components
import DesktopMenu from "./DesktopMenu";
import MobileDrawer from "./MobileDrawer";
import LoginModal from "@/components/auth/login/LoginModal";
import RegisterModal from "@/components/auth/register/RegisterModal";

// Define or Import Types
interface NavbarProps {
    logoUrl?: string;
    siteName?: string;
    menus: any;
}

export default function Navbar({ logoUrl, siteName, menus }: NavbarProps) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);

    // Lock Body Scroll when Mobile Menu is open
    useEffect(() => {
        document.body.style.overflow = isMobileOpen ? 'hidden' : 'unset';
    }, [isMobileOpen]);

    // Handlers
    const openLogin = () => { setIsMobileOpen(false); setIsLoginOpen(true); };
    const openRegister = () => { setIsMobileOpen(false); setIsRegisterOpen(true); };

    return (
        <>
            <header className={styles.header}>
                {/* 1. TOP BAR */}
                <div className={styles.topBar}>
                    <div className={styles.container}>
                        <Link href="/" className={styles.logoWrapper}>
                            <Image
                                src={logoUrl || "/logo.png"}
                                alt={siteName || "TrustBank"}
                                width={180} height={50}
                                className={styles.logoImage}
                                priority
                            />
                        </Link>

                        <div className={styles.topActions}>
                            <Link href="/rates" className={styles.topLink}>
                                <TrendingUp size={14} /> Rates
                            </Link>
                            <Link href="/locations" className={styles.topLink}>
                                <MapPin size={14} /> Locations
                            </Link>
                            <div className={styles.langSelector}>
                                <Globe size={16} /> English <ChevronDown size={12} />
                            </div>
                            <button className={styles.openBtn} onClick={() => setIsRegisterOpen(true)}>
                                OPEN ACCOUNT
                            </button>
                            <button className={styles.loginBtn} onClick={() => setIsLoginOpen(true)}>
                                LOGIN <Lock size={16} />
                            </button>
                        </div>

                        {/* MOBILE TOGGLE */}
                        <button className={styles.mobileToggle} onClick={() => setIsMobileOpen(true)}>
                            <Menu size={24} />
                        </button>
                    </div>
                </div>

                {/* 2. DESKTOP MENU */}
                <DesktopMenu menus={menus} />
            </header>

            {/* 3. MOBILE DRAWER */}
            <MobileDrawer
                isOpen={isMobileOpen}
                onClose={() => setIsMobileOpen(false)}
                onLogin={openLogin}
                onRegister={openRegister}
                menus={menus}
            />

            {/* 4. MODALS */}
            <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} siteName={siteName} />
            <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        </>
    );
}