import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import DashboardView from "../DashboardView";

export default async function DashboardPage() {
    const session = await auth();
    if (!session) redirect("/login");

    const user = await db.user.findUnique({
        where: { email: session.user.email! },
        include: {
            accounts: {
                orderBy: { isPrimary: 'desc' },
                include: {
                    ledgerEntries: {
                        take: 5,
                        orderBy: { createdAt: 'desc' }
                    }
                }
            },
            // 👇 FETCH BENEFICIARIES HERE
            beneficiaries: {
                take: 5,
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!user) return null;

    const totalBalance = user.accounts.reduce((acc, account) => {
        return acc + Number(account.availableBalance);
    }, 0);

    // Pass beneficiaries to the view
    return <DashboardView user={user} totalBalance={totalBalance} beneficiaries={user.beneficiaries} />;
}