'use client';

import Link from "next/link";
import { useState, useRef } from "react";
import { ChevronRight } from "lucide-react";
import styles from "./Navbar.module.css";

// Define the shape of the menu data (or import the interface if preferred)
interface DesktopMenuProps {
    menus: any;
}

export default function DesktopMenu({ menus }: DesktopMenuProps) {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = (menuName: string) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        // Use 'menus' prop instead of constant
        if (menus[menuName]) setActiveMenu(menuName);
        else setActiveMenu(null);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setActiveMenu(null);
        }, 150);
    };

    return (
        <div className={styles.bottomBar} onMouseLeave={handleMouseLeave}>
            <div className={styles.container}>
                <nav className={styles.navLinks}>
                    <Link href="/" className={styles.navItem} onMouseEnter={() => handleMouseEnter('HOME')}>
                        HOME
                    </Link>

                    {/* Iterate over props.menus */}
                    {Object.keys(menus).map((key) => (
                        <Link
                            key={key}
                            href={`/${key.toLowerCase()}`}
                            className={`${styles.navItem} ${activeMenu === key ? styles.active : ''}`}
                            onMouseEnter={() => handleMouseEnter(key)}
                        >
                            {menus[key].title}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* MEGA MENU POPUP */}
            {activeMenu && menus[activeMenu] && (
                <div
                    className={styles.megaMenu}
                    onMouseEnter={() => handleMouseEnter(activeMenu)}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className={styles.megaContainer}>
                        <div className={styles.megaHeader}>
                            <h2>{menus[activeMenu].title}</h2>
                        </div>

                        <div className={styles.megaGrid}>
                            {/* LINKS COLUMN */}
                            {menus[activeMenu].links.map((col: any[], i: number) => (
                                <div key={i} className={styles.linkColumn}>
                                    {col.map((link) => (
                                        <Link key={link.label} href={link.href} className={styles.megaLink}>
                                            {link.label} <ChevronRight size={14} />
                                        </Link>
                                    ))}
                                </div>
                            ))}

                            {/* PROMO COLUMN (Dynamic from CMS) */}
                            {menus[activeMenu].promo && (
                                <div className={styles.promoColumn}>
                                    <h3>{menus[activeMenu].promo.title}</h3>
                                    <p>{menus[activeMenu].promo.desc}</p>
                                    <Link href={menus[activeMenu].promo.href} className={styles.promoBtn}>
                                        {menus[activeMenu].promo.btnText}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}