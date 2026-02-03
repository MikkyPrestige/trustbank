import { auth } from "@/auth";
import { db } from "@/lib/db";
import CreateStaffForm from "@/components/admin/staff/CreateStaffForm";
import PromoteStaffForm from "@/components/admin/staff/PromoteStaffForm";
import StaffList from "@/components/admin/staff/StaffList";
import { ShieldCheck } from "lucide-react";
import { requireSuperAdmin } from "@/lib/auth/admin-auth";
import styles from "../../../components/admin/staff/staff.module.css"

export default async function StaffManagementPage() {
    await requireSuperAdmin()

    // Fetch only Admin and Support staff (Hide Super Admin and Clients)
    const staff = await db.user.findMany({
        where: {
            role: { in: ['ADMIN', 'SUPPORT'] }
        },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            createdAt: true
        }
    });

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>
                        <ShieldCheck size={32} className={styles.titleIcon} />
                        Staff Management
                    </h1>
                    <p className={styles.subtitle}>
                        You are in <strong>Super Admin</strong> mode. Grant or revoke platform access here.
                    </p>
                </div>
            </header>

            <div className={styles.grid}>
                {/* Left Column: Create Form */}
                <div className={styles.formColumn}>
                    <PromoteStaffForm />
                    <CreateStaffForm />
                </div>

                {/* Right Column: Staff List */}
                <div className={styles.listColumn}>
                    <h3 className={styles.sectionHeader}>Active Personnel ({staff.length})</h3>
                    {/* @ts-ignore */}
                    <StaffList staff={staff} />
                </div>
            </div>
        </div>
    );
}