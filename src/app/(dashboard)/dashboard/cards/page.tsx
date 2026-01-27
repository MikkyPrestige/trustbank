import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/content/get-settings";
import { redirect } from "next/navigation";
import ManagedCard from "@/components/dashboard/cards/ManagedCard";
import CardControls from "@/components/dashboard/cards/CardControls";
import { CreditCard, Lock } from "lucide-react";
import styles from "../../../../components/dashboard/cards/cards.module.css";
import Link from "next/link";
import { KycStatus } from "@prisma/client";

export default async function CardsPage() {
    const session = await auth();
    if (!session?.user?.email) redirect("/login");

    const [user, settings] = await Promise.all([
        db.user.findUnique({
            where: { email: session.user.email },
            include: { cards: true }
        }),
        getSiteSettings()
    ]);

    if (!user) return null;
    const isVerified = user.kycStatus === KycStatus.VERIFIED;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>My Cards</h1>
                <p className={styles.subtitle}>Manage your virtual and physical cards securely.</p>
            </header>

            {!isVerified ? (
                <div className={styles.lockedState}>
                    <div className={styles.lockIconBox}><Lock size={32} /></div>
                    <h2>Card Management Locked</h2>
                    <p>For security reasons, you must complete your Identity Verification (KYC) before issuing or managing cards.</p>
                    <Link href="/dashboard/verify" className={styles.verifyBtn}>Complete Verification</Link>
                </div>
            ) : (
                <>
                    {user.cards.length === 0 ? (
                        <div className={styles.emptyState}>
                            <CreditCard size={48} strokeWidth={1.5} className={styles.emptyIcon} />
                            <h3>No Active Cards</h3>
                            <p>You haven&apos;t been issued a virtual card yet. Please contact support.</p>
                        </div>
                    ) : (
                        <div>
                            {user.cards.map((card) => (
                                <div key={card.id} className={styles.grid}>
                                    <ManagedCard card={card} userName={user.fullName} siteName={settings.site_name} />
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