import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import TransactionClient from "@/components/dashboard/transactions/TransactionClient";

export default async function TransactionsPage() {
    const session = await auth();
    if (!session?.user?.email) redirect("/login");

    const user = await db.user.findUnique({
        where: { email: session.user.email }
    });
    if (!user) return redirect("/login");

    const userAccounts = await db.account.findMany({
        where: { userId: user.id },
        select: { id: true }
    });

    const accountIds = userAccounts.map(acc => acc.id);

    const rawTransactions = await db.ledgerEntry.findMany({
        where: {
            accountId: { in: accountIds }
        },
        orderBy: { createdAt: 'desc' },
        include: {
            account: {
                select: { type: true, accountNumber: true }
            }
        }
    });

    const currency = user.currency || "USD";
    let exchangeRate = 1;
    if (currency !== "USD") {
        const rateData = await db.exchangeRate.findUnique({ where: { currency } });
        if (rateData) exchangeRate = Number(rateData.rate);
    }

    const transactions = rawTransactions.map(t => ({
        id: t.id,
        amount: Number(t.amount),
        type: t.type,
        status: t.status,
        direction: t.direction,
        description: t.description || 'System Transaction',
        createdAt: t.createdAt.toISOString(),
        accountName: (t.account?.type || 'External').toUpperCase() + " ••" + (t.account?.accountNumber?.slice(-4) || 'xxxx')
    }));

    return (
        <TransactionClient
            transactions={transactions}
            currency={currency}
            rate={exchangeRate}
        />
    );
}