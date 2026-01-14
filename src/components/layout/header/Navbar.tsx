'use client';

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Search, Lock, Menu, X, ChevronDown, Globe } from "lucide-react";
import styles from "./Navbar.module.css";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className={styles.header}>
            {/* 1. TOP BAR (Logo + Login) */}
            <div className={styles.topBar}>
                <div className={styles.container}>
                    <Link href="/" className={styles.logoWrapper}>
                        <Image
                            src="/logo.png"
                            alt="TrustBank"
                            width={180}
                            height={50}
                            className={styles.logoImage}
                        />
                    </Link>

                    <div className={styles.topActions}>
                        <div className={styles.langSelector}>
                            <Globe size={16} /> English <ChevronDown size={12} />
                        </div>
                        <Link href="/register" className={styles.openBtn}>OPEN ACCOUNT</Link>
                        <Link href="/login" className={styles.loginBtn}>
                            LOGIN <Lock size={16} />
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button className={styles.mobileToggle} onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* 2. BOTTOM BAR (Navigation Links) */}
            <div className={`${styles.bottomBar} ${isOpen ? styles.showMobile : ''}`}>
                <div className={styles.container}>
                    <nav className={styles.navLinks}>
                        <Link href="/" className={styles.navItem}>HOME</Link>
                        <Link href="/bank" className={styles.navItem}>BANK</Link>
                        <Link href="/save" className={styles.navItem}>SAVE</Link>
                        <Link href="/borrow" className={styles.navItem}>BORROW</Link>
                        <Link href="/wealth" className={styles.navItem}>WEALTH & RETIRE</Link>
                        <Link href="/insure" className={styles.navItem}>INSURE</Link>
                        <Link href="/learn" className={styles.navItem}>LEARN & PLAN</Link>
                        <Link href="/payments" className={styles.navItem}>PAYMENTS</Link>
                    </nav>
                </div>
            </div>
        </header>
    );
}