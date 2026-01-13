import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireAdmin() {
    const session = await auth();
    const role = session?.user?.role;

    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        return redirect("/dashboard");
    }
    return session;
}

export async function checkAdminAction() {
    const session = await auth();
    const role = session?.user?.role;

    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        return { authorized: false, message: "Unauthorized" };
    }
    return { authorized: true, session };
}