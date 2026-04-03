import { auth } from '@/auth';
import { db } from '@/lib/db';
import { checkMaintenanceMode } from "@/lib/security";
import { getSiteSettings } from "@/lib/content/get-settings";
import { redirect } from 'next/navigation';
import { UserRole } from "@prisma/client";
import Sidebar from "@/components/dashboard/Sidebar";
import SessionTimeout from "@/components/auth/timeout/SessionTimeout";
import styles from "../../components/dashboard/dashboard.module.css";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session?.user?.email) redirect("/login");

    const [user, actionCount, waitingCount, settings, isMaintenance] = await Promise.all([
        db.user.findUnique({
            where: { email: session.user.email },
            select: {
                fullName: true, image: true, role: true,
                kycStatus: true, status: true, id: true
            }
        }),
        db.wireTransfer.count({
            where: { userId: session.user.id, status: 'ON_HOLD' }
        }),
        db.wireTransfer.count({
            where: { userId: session.user.id, status: 'PENDING_AUTH' }
        }),
        getSiteSettings(),
        checkMaintenanceMode()
    ]);

    if (!user) redirect("/login");

    if (isMaintenance) {
        const allowedRoles: UserRole[] = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPPORT];

        if (!allowedRoles.includes(user.role)) {
            redirect("/maintenance");
        }
    }

    if ((user.status as string) === 'SUSPENDED') {
        redirect("/login?error=AccountSuspended");
    }

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
        isSuperAdmin: user.role === UserRole.SUPER_ADMIN,
        logoUrl: settings.site_logo,
        siteName: settings.site_name
    };

    return (
        <div className={styles.layoutShell}>
            <SessionTimeout />
            <Sidebar data={sidebarData} />
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}
