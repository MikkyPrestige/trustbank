import { db } from "@/lib/db";
import GeneratorForm from "@/components/admin/generator/GeneratorForm";
import styles from "../../../components/admin/generator/generator.module.css";
import { requireAdmin } from "@/lib/auth/admin-auth";
import { Bot } from "lucide-react";
import { UserRole, UserStatus } from "@prisma/client";

export default async function AdminGeneratorPage() {
    await requireAdmin();

    const [accounts, rates] = await Promise.all([
        db.account.findMany({
            where: {
                user: {
                    role: UserRole.CLIENT,
                    status: { not: UserStatus.ARCHIVED }
                }
            },
            include: {
                user: { select: { fullName: true, email: true, currency: true } }
            },
            orderBy: { user: { fullName: 'asc' } }
        }),
        db.exchangeRate.findMany()
    ]);

    const rateMap = accounts.reduce((acc, account) => {
        const currency = account.user.currency || "USD";
        const rate = rates.find(r => r.currency === currency)?.rate || 1;
        // @ts-ignore
        acc[account.id] = { currency, rate: Number(rate) };
        return acc;
    }, {} as Record<string, { currency: string, rate: number }>);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    <Bot size={32} className={styles.titleIcon} />
                    Transaction Generator
                </h1>
                <p className={styles.subtitle}>
                    Automatically generate realistic transaction history for any user account.
                </p>
            </div>

            <GeneratorForm accounts={accounts} rateMap={rateMap} />
        </div>
    );
}