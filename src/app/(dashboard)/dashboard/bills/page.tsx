import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import BillsClient from "@/components/dashboard/bills/BillsClient";
import { getFeatureStatus } from "@/actions/admin/system-status";
import { Ban } from "lucide-react";
import styles from "../../../../components/dashboard/bills/bills.module.css";

export default async function BillsPage() {
    const session = await auth();
    const features = await getFeatureStatus();

    if (!session?.user?.id) redirect("/login");

    const [user, rates] = await Promise.all([
        db.user.findUnique({
            where: { id: session.user.id },
            select: { currency: true }
        }),
        db.exchangeRate.findMany()
    ]);

    const currency = user?.currency || "USD";
    const rate = currency === "USD"
        ? 1
        : Number(rates.find(r => r.currency === currency)?.rate || 1);

    if (!features.bills) {
        return (
            <div className={styles.container}>
                <div className={styles.lockedState}>
                    <div className={styles.lockIconBox}>
                        <Ban size={32} />
                    </div>
                    <h2>Bill Payments Paused</h2>
                    <p>
                        Utility payments are currently disabled by administration. Please check back later.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <BillsClient
            currency={currency}
            rate={rate}
        />
    );
}