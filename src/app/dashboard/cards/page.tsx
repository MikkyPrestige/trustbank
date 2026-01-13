import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import VirtualCard from "./VirtualCard";
import CardControls from "./CardControls";
import { CreditCard, Shield, Lock } from "lucide-react";
import styles from "./cards.module.css";

export default async function CardsPage() {
    const session = await auth();
    if (!session) redirect("/login");

    const user = await db.user.findUnique({
        where: { email: session.user.email! },
        include: {
            cards: { orderBy: { createdAt: 'desc' } }
        }
    });

    if (!user) return null;

    // 👇 FIX: Strictly check for 'VERIFIED'
    const isVerified = user.kycStatus === 'VERIFIED';

    return (
        <div className={styles.container}>

            <header className={styles.header}>
                <h1 className={styles.title}>My Cards</h1>
                <p className={styles.subtitle}>Manage your virtual and physical cards.</p>
            </header>

            {!isVerified ? (
                // 🔒 LOCKED STATE (Copying the style from Crypto/Loan)
                <div className={styles.lockedState}>
                    <div className={styles.lockIconBox}>
                        <Lock size={32} />
                    </div>
                    <h2>Card Management Locked</h2>
                    <p>For security reasons, you must complete your Identity Verification (KYC) before managing cards.</p>
                    <a href="/dashboard/verify" className={styles.verifyBtn}>Complete Verification</a>
                </div>
            ) : (
                // ✅ VERIFIED CONTENT
                <>
                    {user.cards.length === 0 ? (
                        <div className={styles.emptyState}>
                            <CreditCard size={48} strokeWidth={1.5} />
                            <h3>No Active Cards</h3>
                            <p>Contact support to issue a virtual card.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                            {user.cards.map((card) => (
                                <div key={card.id} className={styles.grid}>

                                    {/* LEFT: THE CARD DISPLAY */}
                                    <div className={styles.cardColumn}>
                                        {/* Visual Card */}
                                        <VirtualCard card={card} userName={user.fullName} />

                                        {/* Status Indicator */}
                                        <div className={styles.statusBox}>
                                            <div
                                                className={styles.statusDot}
                                                style={{
                                                    background: card.status === 'ACTIVE' ? '#22c55e' : '#ef4444',
                                                    boxShadow: card.status === 'ACTIVE' ? '0 0 10px #22c55e' : 'none'
                                                }}
                                            ></div>
                                            <span>Status: <strong style={{ color: '#fff' }}>{card.status}</strong></span>
                                        </div>

                                        {/* Security Note */}
                                        <div className={styles.infoBox}>
                                            <Shield size={20} className={styles.shieldIcon} style={{ flexShrink: 0 }} />
                                            <p>Your card details are encrypted and stored securely.</p>
                                        </div>
                                    </div>

                                    {/* RIGHT: CONTROLS */}
                                    <CardControls card={card} />

                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}