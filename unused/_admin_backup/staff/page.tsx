import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import styles from "./staff.module.css";
import CreateStaffForm from "./CreateStaffForm";
import PromoteStaffForm from "./PromoteStaffForm";
import StaffList from "./StaffList";
import { ShieldCheck } from "lucide-react";

export default async function StaffManagementPage() {
    const session = await auth();

    // 🔒 STRICT: Only Super Admin can see this page
    if (session?.user?.role !== 'SUPER_ADMIN') {
        redirect("/admin/dashboard");
    }

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
                <h1 className={styles.title}>
                    <ShieldCheck size={32} style={{ verticalAlign: 'bottom', marginRight: '10px', color: '#fbbf24' }} />
                    Staff Management
                </h1>
                <p className={styles.subtitle}>
                    You are in <strong>Super Admin</strong> mode. Grant or revoke platform access here.
                </p>
            </header>

            <div className={styles.grid}>
                {/* Left Column: Create Form */}
                <div>
                    <PromoteStaffForm />
                    <CreateStaffForm />
                </div>

                {/* Right Column: Staff List */}
                <div>
                    <h3 className={styles.formTitle}>Active Personnel ({staff.length})</h3>
                    <StaffList staff={staff} />
                </div>
            </div>
        </div>
    );
}