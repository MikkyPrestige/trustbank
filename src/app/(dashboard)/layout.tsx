
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { UserRole } from "@prisma/client";
import Sidebar from "@/components/dashboard/Sidebar";
import styles from "../../components/dashboard/dashboard.module.css"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session?.user?.email) redirect("/login");

    // 1. Fetch User & Counts
    const [user, actionCount, waitingCount] = await Promise.all([
        db.user.findUnique({
            where: { email: session.user.email },
            select: {
                fullName: true, image: true, role: true,
                kycStatus: true, status: true, id: true
            }
        }),
        // Count 1: User MUST Act (Enter Codes) -> RED BADGE
        db.wireTransfer.count({
            where: {
                userId: session.user.id,
                status: 'ON_HOLD'
            }
        }),
        // Count 2: User is Waiting (Admin Review) -> BLUE/DEFAULT BADGE
        db.wireTransfer.count({
            where: {
                userId: session.user.id,
                status: 'PENDING_AUTH'
            }
        })
    ]);

    if (!user) redirect("/login");

    if (
        (user.status as string) === 'SUSPENDED') {
        redirect("/login?error=AccountSuspended");
    }

    // 2. Prepare props for the Sidebar
    const sidebarData = {
        user: {
            name: user.fullName || 'User',
            image: user.image,
            role: user.role,
            kycStatus: user.kycStatus,
            isFrozen: (user.status as string) === 'FROZEN' || (user.status as string) === 'SUSPENDED',
        },
        counts: {
            actionRequired: actionCount,
            pendingReview: waitingCount
        },
        isAdmin: user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN || user.role === UserRole.SUPPORT,
        isSuperAdmin: user.role === UserRole.SUPER_ADMIN
    };

    return (
        <div className={styles.layoutShell}>
            <Sidebar data={sidebarData} />
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}