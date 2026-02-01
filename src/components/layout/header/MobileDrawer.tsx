'use client';

import Link from "next/link";
import { X, ChevronRight } from "lucide-react";
import styles from "./Navbar.module.css";

interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: () => void;
    onRegister: () => void;
    menus: any;
}

const ROUTE_MAP: Record<string, string> = {
    BANKING: '/bank',
    LENDING: '/borrow',
    WEALTH: '/wealth',
    INSURE: '/insure',
    RESOURCES: '/learn',
};

export default function MobileDrawer({ isOpen, onClose, onLogin, onRegister, menus }: MobileDrawerProps) {
    return (
        <>
            {/* Backdrop */}
            <div
                className={`${styles.mobileBackdrop} ${isOpen ? styles.mobileBackdropOpen : ''}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={`${styles.mobileDrawer} ${isOpen ? styles.mobileDrawerOpen : ''}`}>
                <div className={styles.drawerHeader}>
                    <span className={styles.drawerTitle}>Menu</span>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <nav className={styles.mobileNavLinks}>
                    {Object.keys(menus).map((key) => (
                        <Link
                            key={key}
                            href={ROUTE_MAP[key] || '#'}
                            className={styles.mobileLink}
                            onClick={onClose}
                        >
                            {menus[key].title} <ChevronRight size={16} />
                        </Link>
                    ))}
                </nav>

                <div className={styles.drawerFooter}>
                    <button className={styles.drawerLoginBtn} onClick={onLogin}>
                        Log In
                    </button>
                    <button className={styles.drawerOpenBtn} onClick={onRegister}>
                        Open Account
                    </button>
                </div>
            </div>
        </>
    );
}