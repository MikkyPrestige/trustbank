import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/get-settings";
import { redirect } from "next/navigation";
import DashboardView from "@/components/dashboard/home/DashboardView";
import { TransactionDirection, TransactionStatus } from "@prisma/client";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/login");
    }

    const settings = await getSiteSettings();

    // 1. Fetch User with Accounts and Ledger Entries
    const userRaw = await db.user.findUnique({
        where: { email: session.user.email },
        include: {
            cards: { orderBy: { createdAt: 'desc' }, take: 1 },
            accounts: {
                include: {
                    ledgerEntries: {
                        take: 10,
                        orderBy: { createdAt: 'desc' }
                    }
                }
            }
        }
    });

    if (!userRaw) redirect("/login");

    // ⏳ 2. SETUP TIME WINDOW
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 📊 2.5. FETCH TREND DATA (Aggregation)
    const [creditStats, debitStats] = await Promise.all([
        // 1. Sum all money COMING IN
        db.ledgerEntry.aggregate({
            where: {
                account: { userId: userRaw.id },
                createdAt: { gte: thirtyDaysAgo },
                status: TransactionStatus.COMPLETED,
                direction: TransactionDirection.CREDIT
            },
            _sum: { amount: true }
        }),
        // 2. Sum all money GOING OUT
        db.ledgerEntry.aggregate({
            where: {
                account: { userId: userRaw.id },
                createdAt: { gte: thirtyDaysAgo },
                status: TransactionStatus.COMPLETED,
                direction: TransactionDirection.DEBIT
            },
            _sum: { amount: true }
        })
    ]);

    // 3. Fetch Beneficiaries
    const rawBeneficiaries = await db.beneficiary.findMany({
        where: { userId: userRaw.id },
        take: 5,
        orderBy: { createdAt: 'desc' }
    });

    const accountNumbers = rawBeneficiaries.map(b => b.accountNumber);
    const internalAccounts = await db.account.findMany({
        where: { accountNumber: { in: accountNumbers } },
        select: {
            accountNumber: true,
            user: { select: { image: true } }
        }
    });

    const beneficiaries = rawBeneficiaries.map(ben => {
        const match = internalAccounts.find(acc => acc.accountNumber === ben.accountNumber);
        return {
            ...ben,
            image: match?.user.image || null
        };
    });

    // 4. SERIALIZATION
    const userSafe = {
        ...userRaw,
        accounts: userRaw.accounts.map(acc => ({
            ...acc,
            availableBalance: Number(acc.availableBalance),
            currentBalance: Number(acc.currentBalance),
            heldBalance: Number(acc.heldBalance),
            ledgerEntries: acc.ledgerEntries.map(entry => ({
                ...entry,
                amount: Number(entry.amount),
                balanceAfter: Number(entry.balanceAfter)
            }))
        }))
    };

    // 5. CALCULATE TOTALS & TRENDS
    const totalBalance = userSafe.accounts.reduce((sum, acc) => sum + acc.availableBalance, 0);

    // Extract aggregated sums
    const moneyIn = Number(creditStats._sum.amount || 0);
    const moneyOut = Number(debitStats._sum.amount || 0);

    // Math: PreviousBalance = Current - (In - Out)
    const netChange = moneyIn - moneyOut;
    const startBalance = totalBalance - netChange;

    let trendPercent = 0;
    if (startBalance === 0) {
        trendPercent = totalBalance > 0 ? 100 : 0;
    } else {
        trendPercent = ((totalBalance - startBalance) / startBalance) * 100;
    }

    return (
        <DashboardView
            user={userSafe}
            totalBalance={totalBalance}
            beneficiaries={beneficiaries}
            trend={trendPercent}
            settings={settings}
        />
    );
}


// import { auth } from "@/auth";
// import { db } from "@/lib/db";
// import { redirect } from "next/navigation";
// import DashboardView from "@/components/dashboard/home/DashboardView";

// export default async function DashboardPage() {
//     const session = await auth();

//     if (!session?.user?.email) {
//         redirect("/login");
//     }

//     // 1. Fetch User with Accounts and Ledger Entries
//     const userRaw = await db.user.findUnique({
//         where: { email: session.user.email },
//         include: {
//             cards: { orderBy: { createdAt: 'desc' }, take: 1 },
//             accounts: {
//                 include: {
//                     ledgerEntries: {
//                         take: 10,
//                         orderBy: { createdAt: 'desc' }
//                     }
//                 }
//             }
//         }
//     });

//     if (!userRaw) redirect("/login");

//     // 2. Fetch Beneficiaries
//     const rawBeneficiaries = await db.beneficiary.findMany({
//         where: { userId: userRaw.id },
//         take: 5,
//         orderBy: { createdAt: 'desc' }
//     });

//     const accountNumbers = rawBeneficiaries.map(b => b.accountNumber);
//     const internalAccounts = await db.account.findMany({
//         where: { accountNumber: { in: accountNumbers } },
//         select: {
//             accountNumber: true,
//             user: { select: { image: true } }
//         }
//     });

//     const beneficiaries = rawBeneficiaries.map(ben => {
//         const match = internalAccounts.find(acc => acc.accountNumber === ben.accountNumber);
//         return {
//             ...ben,
//             image: match?.user.image || null
//         };
//     });

//     // 3. SERIALIZATION (The Fix)
//     const userSafe = {
//         ...userRaw,
//         accounts: userRaw.accounts.map(acc => ({
//             ...acc,
//             // Convert Account Balances
//             availableBalance: Number(acc.availableBalance),
//             currentBalance: Number(acc.currentBalance),
//             heldBalance: Number(acc.heldBalance),

//             // Convert Ledger Entries inside the account
//             ledgerEntries: acc.ledgerEntries.map(entry => ({
//                 ...entry,
//                 amount: Number(entry.amount),
//                 balanceAfter: Number(entry.balanceAfter)
//             }))
//         }))
//     };

//     // 4. Calculate Total Balance
//     const totalBalance = userSafe.accounts.reduce((sum, acc) => sum + acc.availableBalance, 0);

//     return (
//         <DashboardView
//             user={userSafe}
//             totalBalance={totalBalance}
//             beneficiaries={beneficiaries}
//         />
//     );
// }