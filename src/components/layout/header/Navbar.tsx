'use client';



import Link from "next/link";

import Image from "next/image";

import { useEffect, useState } from "react";

import { Lock, Menu, X, ChevronDown, Globe, ChevronRight } from "lucide-react";

import styles from "./Navbar.module.css";

import LoginModal from "@/components/auth/login/LoginModal";

import RegisterModal from "@/components/auth/register/RegisterModal";



// --- CONFIGURATION: Define your Mega Menus here ---

const MEGA_MENUS: Record<string, any> = {

    BANK: {

        title: "BANKING",

        links: [

            [

                { label: "Checking Accounts", href: "/bank#checking" },

                { label: "Business Banking", href: "/bank#business" },

                { label: "Global Transfers", href: "/bank#global" },

            ],

            [

                { label: "Debit Cards", href: "/bank#cards" },

                { label: "Student Banking", href: "/bank#student" },

                { label: "ATMs & Locations", href: "/bank#locations" },

            ]

        ],

        promo: {

            title: "Switch in 3 Minutes",

            desc: "Move your direct deposit to TrustBank and get paid up to 2 days early.",

            btnText: "Open Checking",

            href: "/register"

        }

    },

    SAVE: {

        title: "SAVINGS",

        links: [

            [

                { label: "High Yield Savings", href: "/save#hysa" },

                { label: "Certificates of Deposit (CDs)", href: "/save#cds" },

                { label: "Money Market", href: "/save#mma" },

            ],

            [

                { label: "Trust Kids Club", href: "/save#kids" },

                { label: "Retirement (IRAs)", href: "/wealth/ira" },

                { label: "Savings Calculator", href: "/save" },

            ]

        ],

        promo: {

            title: "Earn 4.50% APY",

            desc: "Watch your wealth grow with our industry-leading High Yield Savings account.",

            btnText: "Start Saving",

            href: "/save"

        }

    },

    BORROW: {

        title: "LENDING",

        links: [

            [

                { label: "Credit Cards", href: "/borrow#cards" },

                { label: "Personal Loans", href: "/borrow#personal" },

                { label: "Mortgages", href: "/borrow#home" },

            ],

            [

                { label: "Auto Loans", href: "/borrow#auto" },

                { label: "Student Loans", href: "/borrow#student" },

                { label: "Loan Calculator", href: "/borrow" },

            ]

        ],

        promo: {

            title: "0% Intro APR",

            desc: "Pay no interest for 15 months on purchases and balance transfers.",

            btnText: "View Cards",

            href: "/borrow"

        }

    },

    WEALTH: {

        title: "WEALTH MANAGEMENT",

        links: [

            [

                { label: "Investment Advisory", href: "/wealth#advisory" },

                { label: "Private Client Group", href: "/wealth#private" },

                { label: "Financial Planning", href: "/wealth#planning" },

            ],

            [

                { label: "Retirement (IRAs & 401k)", href: "/wealth#retirement" },

                { label: "Estate & Trust Services", href: "/wealth#estate" },

                { label: "Portfolio Simulator", href: "/wealth" },

            ]

        ],

        promo: {

            title: "Private Consultation",

            desc: "Get a complimentary portfolio strategy review with a dedicated fiduciary advisor.",

            btnText: "Meet an Advisor",

            href: "/wealth"

        }

    },

    INSURE: {

        title: "INSURANCE",

        links: [

            [

                { label: "Medicare Insurance", href: "/insure#medicare" },

                { label: "Auto Insurance", href: "/insure#auto" },

                { label: "Homeowners & Renters", href: "/insure#home" },

            ],

            [

                { label: "Life Insurance", href: "/insure#life" },

                { label: "Accidental Death", href: "/insure#ad" },

                { label: "Hospital Accident", href: "/insure#hospital" },

            ]

        ],

        promo: {

            title: "Let's Navigate Medicare",

            desc: "Trust offers dedicated specialists to help you prepare and understand your options.",

            btnText: "Learn More",

            href: "/insure"

        }

    },

    PAYMENTS: {

        title: "PAYMENTS CENTER",

        links: [

            [

                { label: "Pay Bills", href: "/payments#bills" },

                { label: "Send to Friends (P2P)", href: "/payments#p2p" },

                { label: "Wire Transfers", href: "/payments#wire" },

            ],

            [

                { label: "Loan Payments", href: "/payments#loans" },

                { label: "Manage AutoPay", href: "/payments#autopay" },

                { label: "Global Transfer Estimator", href: "/payments" },

            ]

        ],

        promo: {

            title: "Global Transfers",

            desc: "Send money to 40+ countries instantly with zero hidden fees.",

            btnText: "Start Transfer",

            href: "/payments"

        }

    },

    LEARN: {

        title: "LEARNING CENTER",

        links: [

            [

                { label: "Financial Basics 101", href: "/learn#basics" },

                { label: "Investing Guides", href: "/learn#investing" },

                { label: "Retirement Strategies", href: "/learn#retirement" },

            ],

            [

                { label: "Market News & Analysis", href: "/learn#news" },

                { label: "Business Insights", href: "/learn#business" },

                { label: "Financial Wellness Pulse", href: "/learn" },

            ]

        ],

        promo: {

            title: "The Weekly Brief",

            desc: "Subscribe to our curated newsletter for the latest market moves.",

            btnText: "Read Latest Issue",

            href: "/learn"

        }

    },

};



export default function Navbar() {

    const [isOpen, setIsOpen] = useState(false);

    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const [isLoginOpen, setIsLoginOpen] = useState(false);

    const [isRegisterOpen, setIsRegisterOpen] = useState(false);



    // Lock Body Scroll when Mobile Menu is open

    useEffect(() => {

        if (isOpen) {

            document.body.style.overflow = 'hidden';

        } else {

            document.body.style.overflow = 'unset';

        }

    }, [isOpen]);



    // Logic to handle hover

    const handleMouseEnter = (menuName: string) => {

        if (MEGA_MENUS[menuName]) {

            setActiveMenu(menuName);

        } else {

            setActiveMenu(null);

        }

    };



    const handleMouseLeave = () => setActiveMenu(null);



    // Helper to render the active mega menu content

    const renderMegaMenu = () => {

        if (!activeMenu || !MEGA_MENUS[activeMenu]) return null;



        const menu = MEGA_MENUS[activeMenu];



        return (

            <div className={styles.megaMenu} onMouseEnter={() => setActiveMenu(activeMenu)} onMouseLeave={handleMouseLeave}>

                <div className={styles.megaContainer}>

                    {/* Header */}

                    <div className={styles.megaHeader}>

                        <h2>{menu.title}</h2>

                    </div>



                    <div className={styles.megaGrid}>

                        {/* Dynamic Columns */}

                        {menu.links.map((col: any[], i: number) => (

                            <div key={i} className={styles.linkColumn}>

                                {col.map((link: any) => (

                                    <Link key={link.label} href={link.href} className={styles.megaLink}>

                                        {link.label} <ChevronRight size={14} />

                                    </Link>

                                ))}

                            </div>

                        ))}



                        {/* Promo Column */}

                        <div className={styles.promoColumn}>

                            <h3>{menu.promo.title}</h3>

                            <p>{menu.promo.desc}</p>

                            <Link href={menu.promo.href} className={styles.promoBtn}>

                                {menu.promo.btnText}

                            </Link>

                        </div>

                    </div>

                </div>

            </div>

        );

    };



    return (

        <>

            <header className={styles.header} onMouseLeave={handleMouseLeave}>



                {/* 1. TOP BAR */}

                <div className={styles.topBar}>

                    <div className={styles.container}>

                        <Link href="/" className={styles.logoWrapper}>

                            <Image src="/logo.png" alt="TrustBank" width={180} height={50} className={styles.logoImage} />

                        </Link>



                        <div className={styles.topActions}>

                            <div className={styles.langSelector}>

                                <Globe size={16} /> English <ChevronDown size={12} />

                            </div>

                            <button

                                className={styles.openBtn}

                                onClick={() => setIsRegisterOpen(true)}

                            >

                                OPEN ACCOUNT

                            </button>



                            <button

                                className={styles.loginBtn}

                                onClick={() => setIsLoginOpen(true)}

                            >

                                LOGIN <Lock size={16} />

                            </button>

                        </div>



                        {/* MOBILE TOGGLE BUTTON */}

                        <button className={styles.mobileToggle} onClick={() => setIsOpen(true)}>

                            <Menu size={24} />

                        </button>

                    </div>

                </div>



                {/* 2. BOTTOM BAR (Desktop Navigation) */}

                <div className={styles.bottomBar}>

                    <div className={styles.container}>

                        <nav className={styles.navLinks}>

                            <Link href="/" className={styles.navItem} onMouseEnter={() => handleMouseEnter('HOME')}>HOME</Link>

                            {Object.keys(MEGA_MENUS).map((key) => (

                                <Link

                                    key={key}

                                    href={`/${key.toLowerCase()}`}

                                    className={`${styles.navItem} ${activeMenu === key ? styles.active : ''}`}

                                    onMouseEnter={() => handleMouseEnter(key)}

                                >

                                    {MEGA_MENUS[key].title}

                                </Link>

                            ))}

                            <Link href="/help" className={styles.navItem} onMouseEnter={() => handleMouseEnter('HELP')}>FAQ</Link>

                        </nav>

                    </div>

                </div>



                {/* 3. MEGA MENU RENDERER */}

                {renderMegaMenu()}



            </header>



            {/* ✅ 4. MOBILE DRAWER (High-Grade Side Menu) */}



            {/* Backdrop */}

            <div

                className={`${styles.mobileBackdrop} ${isOpen ? styles.mobileBackdropOpen : ''}`}

                onClick={() => setIsOpen(false)}

            />



            {/* Drawer */}

            <div className={`${styles.mobileDrawer} ${isOpen ? styles.mobileDrawerOpen : ''}`}>

                <div className={styles.drawerHeader}>

                    <span className={styles.drawerTitle}>Menu</span>

                    <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>

                        <X size={20} />

                    </button>

                </div>



                <nav className={styles.mobileNavLinks}>

                    <Link href="/" className={styles.mobileLink} onClick={() => setIsOpen(false)}>

                        Home <ChevronRight size={16} />

                    </Link>

                    {/* Render Links Dynamically */}

                    {Object.keys(MEGA_MENUS).map((key) => (

                        <Link

                            key={key}

                            href={`/${key.toLowerCase()}`}

                            className={styles.mobileLink}

                            onClick={() => setIsOpen(false)}

                        >

                            {MEGA_MENUS[key].title} <ChevronRight size={16} />

                        </Link>

                    ))}

                    <Link href="/help" className={styles.mobileLink} onClick={() => setIsOpen(false)}>

                        Help Center <ChevronRight size={16} />

                    </Link>

                </nav>



                <div className={styles.drawerFooter}>

                    <button

                        className={styles.drawerLoginBtn}

                        onClick={() => { setIsOpen(false); setIsLoginOpen(true); }}

                    >

                        Log In

                    </button>

                    <button

                        className={styles.drawerOpenBtn}

                        onClick={() => { setIsOpen(false); setIsRegisterOpen(true); }}

                    >

                        Open Account

                    </button>

                </div>

            </div>



            {/* MODALS */}

            <RegisterModal

                isOpen={isRegisterOpen}

                onClose={() => setIsRegisterOpen(false)}

            />



            <LoginModal

                isOpen={isLoginOpen}

                onClose={() => setIsLoginOpen(false)}

            />
        </>
    );

}