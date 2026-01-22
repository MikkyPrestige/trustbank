"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ArrowUpRight, ArrowDownLeft, Send, Globe, CreditCard as CardIcon,
    Plus, MoreHorizontal, Eye, EyeOff, Copy, Check, AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";
import styles from "../app/(main)/dashboard/dashboard.module.css";

interface DashboardViewProps {
    user: any;
    totalBalance: number;
    beneficiaries: any[];
}

export default function DashboardView({ user, totalBalance, beneficiaries }: DashboardViewProps) {
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const toggleVisibility = () => setIsVisible(!isVisible);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success("Account Number Copied!");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const displayMoney = (amount: number) => {
        if (!isVisible) return "••••••";
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const displayCardNumber = (num: string) => {
        if (!isVisible) return "•••• •••• •••• ••••";
        return num.replace(/(.{4})/g, '$1 ').trim();
    };

    const primaryAccount = user.accounts[0];
    const isFrozen = user.status === 'FROZEN'; // 👈 Check Freeze Status

    return (
        <div className={styles.container}>

            {/* 👇 ALERT BANNER FOR FROZEN USERS */}
            {isFrozen && (
                <div style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                }}>
                    <AlertTriangle size={24} strokeWidth={2.5} />
                    <div>
                        <strong style={{ display: 'block', fontSize: '0.95rem' }}>Account Frozen</strong>
                        <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                            Your account is temporarily locked for security. Outgoing transfers, wires, and trading are disabled.
                            Please contact support to restore access.
                        </span>
                    </div>
                </div>
            )}
            {/* 👆 END ALERT */}

            {/* TOP BAR */}
            <div className={styles.topBar}>
                <div>
                    <h1 className={styles.welcome}>Good {new Date().getHours() < 12 ? "Morning" : "Evening"}, {user.fullName.split(' ')[0]}</h1>
                    <p className={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                        onClick={toggleVisibility}
                        className={styles.privacyBtn}
                        title={isVisible ? "Hide Details" : "Show Details"}
                    >
                        {isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>

                    <div className={styles.userAvatar}>
                        {user.fullName.charAt(0)}
                    </div>
                </div>
            </div>

            {/* QUICK ACTIONS - Optionally dim these if frozen */}
            <div className={styles.quickActionsBar} style={isFrozen ? { opacity: 0.6, pointerEvents: 'none', filter: 'grayscale(1)' } : {}}>
                <Link href="/dashboard/transfer" className={styles.actionItem}>
                    <div className={styles.actionIcon}><Send size={20} /></div>
                    <span>Transfer</span>
                </Link>
                <Link href="/dashboard/wire" className={styles.actionItem}>
                    <div className={styles.actionIcon}><Globe size={20} /></div>
                    <span>Wire</span>
                </Link>
                <Link href="/dashboard/cards" className={styles.actionItem}>
                    <div className={styles.actionIcon}><CardIcon size={20} /></div>
                    <span>Cards</span>
                </Link>
                <div style={{ position: 'relative' }}>
                    <button
                        className={styles.actionItem}
                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                    >
                        <div className={`${styles.actionIcon} ${styles.actionMore}`}>
                            <MoreHorizontal size={20} />
                        </div>
                        <span>More</span>
                    </button>

                    {showMoreMenu && (
                        <div className={styles.moreDropdown}>
                            <Link href="/dashboard/loans" className={styles.dropItem}><span>Loans</span></Link>
                            <Link href="/dashboard/crypto" className={styles.dropItem}><span>Crypto</span></Link>
                            <Link href="/dashboard/settings" className={styles.dropItem}><span>Settings</span></Link>
                            <div className={styles.dropDivider}></div>
                            <Link href="/dashboard/beneficiaries" className={styles.dropItem}><span>Beneficiaries</span></Link>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.mainGrid}>
                {/* LEFT COLUMN */}
                <div className={styles.leftCol}>
                    <div className={styles.liquidityCard}>
                        <div className={styles.liquidityLabel}>Total Liquidity</div>
                        <h2 className={styles.totalAmount}>{displayMoney(totalBalance)}</h2>
                        <div className={styles.liquidityTrend}>
                            <span className={styles.trendPositive}>+2.4%</span> vs last month
                        </div>
                    </div>

                    <div className={styles.sectionHeader}>
                        <h3>Accounts</h3>
                    </div>
                    <div className={styles.accountList}>
                        {user.accounts.map((acc: any) => (
                            <div key={acc.id} className={styles.accountRow}>
                                <div className={styles.accInfo}>
                                    <div className={styles.accIcon}>{acc.type.charAt(0)}</div>
                                    <div>
                                        <p className={styles.accName}>{acc.type} Account</p>
                                        <div className={styles.accNumWrapper}>
                                            <p className={styles.accNum}>
                                                {isVisible
                                                    ? acc.accountNumber
                                                    : `•••• ${acc.accountNumber.slice(-4)}`
                                                }
                                            </p>
                                            {isVisible && (
                                                <button
                                                    onClick={() => copyToClipboard(acc.accountNumber, acc.id)}
                                                    className={styles.copyBtn}
                                                    title="Copy Account Number"
                                                >
                                                    {copiedId === acc.id ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.accBal}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                                        <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1rem' }}>
                                            {displayMoney(Number(acc.availableBalance))}
                                        </span>
                                        <span style={{ fontSize: '0.65rem', color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Available
                                        </span>
                                        <div style={{ marginTop: '6px', textAlign: 'right', borderTop: '1px solid #333', paddingTop: '4px' }}>
                                            <span style={{ color: '#999', fontSize: '0.85rem' }}>
                                                {displayMoney(Number(acc.currentBalance))}
                                            </span>
                                            <br />
                                            <span style={{ fontSize: '0.65rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                Current
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.sectionHeader} style={{ marginTop: '2rem' }}>
                        <h3>Recent Transactions</h3>
                        <Link href="/dashboard/transactions" className={styles.viewAll}>View All</Link>
                    </div>
                    <div className={styles.activityFeed}>
                        {user.accounts.flatMap((a: any) => a.ledgerEntries).length === 0 ? (
                            <div className={styles.emptyState}>No recent activity</div>
                        ) : (
                            user.accounts
                                .flatMap((a: any) => a.ledgerEntries)
                                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                .slice(0, 5)
                                .map((tx: any) => (
                                    <div key={tx.id} className={styles.txRow}>
                                        <div className={styles.txLeft}>
                                            <div className={`${styles.txIcon} ${tx.direction === 'CREDIT' ? styles.iconCredit : styles.iconDebit}`}>
                                                {tx.direction === 'CREDIT' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                            </div>
                                            <div className={styles.txDetails}>
                                                <p className={styles.txDesc}>{tx.description || 'Transfer'}</p>
                                                <p className={styles.txDate}>{new Date(tx.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className={`${styles.txAmount} ${tx.direction === 'CREDIT' ? styles.amtCredit : styles.amtDebit}`}>
                                            {tx.direction === 'CREDIT' ? '+' : '-'}
                                            {displayMoney(Number(tx.amount)).replace('+', '').replace('-', '')}
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className={styles.rightCol}>
                    <div className={styles.sectionHeader}>
                        <h3>Quick Send</h3>
                        <Link href="/dashboard/beneficiaries"><Plus size={18} /></Link>
                    </div>
                    <div className={styles.quickSendWidget}>
                        {beneficiaries.length === 0 ? (
                            <div className={styles.emptyBeneficiary}>
                                <p>No saved contacts.</p>
                                <Link href="/dashboard/beneficiaries" className={styles.addBenLink}>Add One</Link>
                            </div>
                        ) : (
                            <div className={styles.beneficiaryScroll}>
                                {/* Disable Adding if Frozen */}
                                {!isFrozen && (
                                    <Link href="/dashboard/transfer" className={styles.addBenCircle}>
                                        <Plus size={20} />
                                    </Link>
                                )}
                                {beneficiaries.map(ben => (
                                    <Link href={`/dashboard/wire?beneficiaryId=${ben.id}`} key={ben.id} className={styles.benCircle} title={ben.accountName}>
                                        <div className={styles.benAvatar}>
                                            {ben.accountName.charAt(0).toUpperCase()}
                                        </div>
                                        <span className={styles.benName}>{ben.accountName.split(' ')[0]}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={styles.sectionHeader} style={{ marginTop: '2rem' }}>
                        <h3>My Card</h3>
                        <Link href="/dashboard/cards"><Plus size={18} /></Link>
                    </div>

                    <div className={styles.visaCard} style={isFrozen ? { filter: 'grayscale(1)', opacity: 0.8 } : {}}>
                        <div className={styles.cardGlass}></div>
                        {isFrozen && (
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.8rem', zIndex: 10 }}>
                                LOCKED
                            </div>
                        )}
                        <div className={styles.cardTop}>
                            <span className={styles.bankName}>TrustBank</span>
                            <span className={styles.cardType}>Visa Infinite</span>
                        </div>
                        <div className={styles.chip}></div>
                        <div className={styles.cardNumber}>
                            {primaryAccount ? displayCardNumber(primaryAccount.accountNumber) : '•••• •••• •••• 0000'}
                        </div>
                        <div className={styles.cardBottom}>
                            <div className={styles.cardHolder}>
                                <span>Card Holder</span>
                                <p>{user.fullName.toUpperCase()}</p>
                            </div>
                            <div className={styles.cardExpires}>
                                <span>Expires</span>
                                <p>12/28</p>
                            </div>
                        </div>
                    </div>

                    {!isFrozen && (
                        <div className={styles.promoCard}>
                            <div className={styles.promoIcon}>
                                <Globe size={24} color="#3b82f6" />
                            </div>
                            <h4>International Transfer</h4>
                            <p>Send money abroad with 0% fees this week.</p>
                            <Link href="/dashboard/wire" className={styles.promoBtn}>Send Now</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}