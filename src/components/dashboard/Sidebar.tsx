'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import {
    LayoutDashboard, ArrowRightLeft, CreditCard, History, Settings,
    LogOut, Menu, Globe, Users, ShieldCheck,
    FileText, IdCard, Lock, Bitcoin, Banknote, HelpCircle, Landmark
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import styles from './dashboard.module.css';

interface SidebarProps {
    data: {
        user: {
            name: string;
            image?: string | null;
            role: string;
            kycStatus: string;
            isFrozen: boolean;
        };
        counts: {
            actionRequired: number;
            pendingReview: number;
        };
        isAdmin: boolean;
        isSuperAdmin: boolean;
        logoUrl?: string;
        siteName?: string;
    };
}

export default function Sidebar({ data }: SidebarProps) {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const isVerified = data.user.kycStatus === 'VERIFIED';
    const isPending = data.user.kycStatus === 'PENDING';
    const actionRequired = !isVerified && !isPending;
    const wireTotal = data.counts.actionRequired + data.counts.pendingReview;
    const wireBadgeVariant = data.counts.actionRequired > 0 ? 'danger' : 'default';

    const logoSource = data.logoUrl || '/logo.png';
    const siteTitle = data.siteName || 'Trust Bank';

    return (
        <>
            <div className={styles.mobileHeader}>
                <Link href="/dashboard">
                    <Image src={logoSource} alt={siteTitle} width={140} height={40} className={styles.logoImage} />
                </Link>
                <button onClick={() => setIsMobileOpen(true)} className={styles.mobileToggleBtn}>
                    <Menu size={24} className={styles.menuIcon} />
                </button>
            </div>

            <div
                className={`${styles.overlay} ${isMobileOpen ? styles.visible : ''}`}
                onClick={() => setIsMobileOpen(false)}
            />

            {/* SIDEBAR */}
            <aside className={`${styles.sidebar} ${isMobileOpen ? styles.open : ''}`}>
                <div className={styles.logoArea}>
                    <Link href="/dashboard" onClick={() => setIsMobileOpen(false)}>
                        <Image src={logoSource} alt={siteTitle} width={160} height={45} className={styles.logoImage} />
                    </Link>
                </div>

                <nav className={styles.navMenu}>
                    {/* SECTION: PERSONAL */}
                    <p className={styles.navLabel}>Personal Banking</p>
                    <NavItem href="/dashboard" icon={LayoutDashboard} label="Overview" active={pathname === '/dashboard'} />
                    <NavItem href="/dashboard/transactions" icon={History} label="Transactions" active={pathname.includes('/transactions')} />

                    <div className={styles.divider}></div>
                    {/* SECTION: MONEY MOVEMENT */}
                    <p className={styles.navLabel}>Money & Assets</p>
                    <NavItem href="/dashboard/transfer" icon={ArrowRightLeft} label="Transfer" active={pathname.includes('/transfer')} />
                    <NavItem
                        href="/dashboard/wire"
                        icon={Globe}
                        label="Intl. Wire"
                        active={pathname.includes('/wire')}
                        count={wireTotal}
                        badgeVariant={wireBadgeVariant}
                    />
                    <NavItem href="/dashboard/beneficiaries" icon={Users} label="Beneficiaries" active={pathname.includes('/beneficiaries')} />
                    <NavItem href="/dashboard/cards" icon={CreditCard} label="Cards" active={pathname.includes('/cards')} />
                    <NavItem href="/dashboard/crypto" icon={Bitcoin} label="Crypto" active={pathname.includes('/crypto')} />
                    <NavItem href="/dashboard/loans" icon={Landmark} label="Loans" active={pathname.includes('/loans')} />
                    <NavItem href="/dashboard/bills" icon={Banknote} label="Bills" active={pathname.includes('/bills')} />

                    <div className={styles.divider}></div>

                    {/* SECTION: PREFERENCES */}
                    <p className={styles.navLabel}>Preferences</p>
                    <NavItem href="/dashboard/settings" icon={Settings} label="Settings" active={pathname.includes('/settings')} />
                    <NavItem href="/dashboard/support" icon={HelpCircle} label="Help Center" active={pathname.includes('/help')} />

                    {/* SECTION: ADMIN (Conditional) */}
                    {data.isAdmin && (
                        <>
                            <div className={styles.divider}></div>
                            <p className={`${styles.navLabel} ${styles.adminLabel}`}>Admin Panel</p>

                            <NavItem href="/admin" icon={ShieldCheck} label="Overview" active={pathname === '/admin'} variant="admin" />
                            <NavItem href="/admin/users" icon={Users} label="Clients" active={pathname.includes('/admin/users')} variant="admin" />
                            <NavItem href="/admin/wires" icon={FileText} label="Approvals" active={pathname.includes('/admin/wires')} variant="admin" />

                            {data.isSuperAdmin && (
                                <NavItem href="/admin/staff" icon={IdCard} label="Staff" active={pathname.includes('/admin/staff')} variant="admin" />
                            )}
                        </>
                    )}
                </nav>

                <div className={styles.userProfile}>
                    <Link href="/dashboard/profile" className={styles.avatarWrapper}>
                        <div className={styles.avatar}>
                            {data.user.image ? (
                                <Image
                                    src={data.user.image}
                                    alt="Profile"
                                    width={40}
                                    height={40}
                                    className={styles.userAvatarImg}
                                />
                            ) : (
                                data.user.name.charAt(0).toUpperCase()
                            )}
                        </div>

                        {/* Status Indicator Dot */}
                        <div className={`${styles.statusDot} ${data.user.isFrozen ? styles.dotFrozen :
                            isVerified ? styles.dotVerified :
                                styles.dotPending
                            }`} />
                    </Link>

                    <div className={styles.userInfo}>
                        <Link href="/dashboard/profile" className={styles.userName}>
                            {data.user.name}
                        </Link>

                        {(data.user.isFrozen || actionRequired) && (
                            <span className={styles.userRole}>
                                {data.user.isFrozen ? (
                                    <span className={styles.frozenText}>
                                        <Lock size={10} /> Frozen
                                    </span>
                                ) : (
                                    <Link href="/dashboard/verify" className={styles.kycLink}>
                                        Complete KYC →
                                    </Link>
                                )}
                            </span>
                        )}
                    </div>

                    <button onClick={() => signOut({ callbackUrl: '/login' })} className={styles.logoutBtn}>
                        <LogOut size={18} />
                    </button>
                </div>
            </aside>
        </>
    );
}

function NavItem({
    href, icon: Icon, label, active, variant, count, badgeVariant
}: {
    href: string, icon: any, label: string, active: boolean, variant?: 'admin' | 'default', count?: number, badgeVariant?: 'danger' | 'default'
}) {
    return (
        <Link
            href={href}
            className={`${styles.navItem} ${active ? styles.active : ''} ${variant === 'admin' ? styles.adminItem : ''}`}
        >
            <Icon size={20} className={styles.navIcon} />
            <span className={styles.navText}>{label}</span>

            {count && count > 0 && (
                <span className={`${styles.navBadge} ${badgeVariant === 'danger' ? styles.badgeDanger : ''}`}>
                    {count}
                </span>
            )}
        </Link>
    );
}
