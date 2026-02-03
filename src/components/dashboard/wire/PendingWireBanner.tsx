import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";
import styles from "./styles/wire.module.css";
import { TransactionStatus } from "@prisma/client";

export default async function PendingWireBanner() {
    const session = await auth();
    if (!session) return null;

    const actionRequiredCount = await db.wireTransfer.count({
        where: {
            userId: session.user.id,
            status: TransactionStatus.ON_HOLD
        }
    });

    if (actionRequiredCount === 0) return null;

    return (
        <div className={styles.banner}>
            <div className={styles.content}>
                <div className={styles.iconWrapper}>
                    <AlertCircle size={20} />
                </div>
                <div>
                    <h4 className={styles.title}>Clearance Required</h4>
                    <p className={styles.text}>
                        You have <strong>{actionRequiredCount} wire transfer{actionRequiredCount > 1 ? 's' : ''}</strong> pending clearance code entry.
                    </p>
                </div>
            </div>

            <Link href="/dashboard/wire/status" className={styles.button}>
                Enter Codes <ArrowRight size={14} />
            </Link>
        </div>
    );
}