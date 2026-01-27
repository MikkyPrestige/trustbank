import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";

/**
 * 🔒 Page Protection: Redirects if not Admin
 */
export async function requireAdmin() {
    const session = await auth();
    const role = session?.user?.role;

    if (role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN && role !== UserRole.SUPPORT) {
        return redirect("/dashboard");
    }
    return session;
}

/**
 * 🔒 Action Protection: Returns status object (for Server Actions)
 */
export async function checkAdminAction() {
    const session = await auth();

    if (!session || !session.user) {
        return { authorized: false, message: "Unauthorized: No Session" };
    }

    const role = session.user.role;

    if (role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN && role !== UserRole.SUPPORT) {
        return { authorized: false, message: "Unauthorized: Insufficient Permissions" };
    }

    return { authorized: true, session };
}

/**
 * 🔒 STRICT Protection: Super Admin Only (For Staff Management)
 */
export async function requireSuperAdmin() {
    const session = await auth();
    if (session?.user?.role !== UserRole.SUPER_ADMIN) {
        return redirect("/admin/dashboard");
    }
    return session;
}