import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    // 1. DATABASE CHECK: Is this user actually an ADMIN?
    const user = await db.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user || user.role !== 'ADMIN') {
        // Kick them back to the client dashboard
        redirect("/dashboard");
    }

    return (
        <div style={{ minHeight: '100vh', background: '#111', color: '#fff' }}>
            {/* Admin Top Bar */}
            <nav style={{
                borderBottom: '1px solid #333',
                padding: '1rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#000'
            }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', letterSpacing: '1px' }}>
                    TrustBank <span style={{ color: 'red' }}>ADMIN</span>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem' }}>
                    <Link href="/admin" style={{ color: '#fff', textDecoration: 'none' }}>Overview</Link>
                    <Link href="/admin/loans" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>Loan Queue</Link>
                    <Link href="/admin/users" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>Users</Link>
                    <Link href="/admin/verifications" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>KYC</Link>
                    <Link href="/dashboard" style={{ color: '#888', textDecoration: 'none' }}>Exit to Client View →</Link>
                </div>
            </nav>

            <main style={{ padding: '2rem' }}>
                {children}
            </main>
        </div>
    );
}