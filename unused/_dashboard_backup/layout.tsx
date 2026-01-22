import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Sidebar from "./Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    return (
        // Premium Dark Background
        <div style={{ display: 'flex', minHeight: '100vh', background: '#050505', color: '#fff' }}>

            <Sidebar />

            <main style={{
                flex: 1,
                marginLeft: '260px',
                padding: '0',
                overflowY: 'auto',
                position: 'relative'
            }}>
                {children}
            </main>
        </div>
    );
}