'use client';

import { useState } from "react";
import { revokeUserSessions } from "@/actions/admin/security";
import { LogOut, Loader2 } from "lucide-react";
import styles from "./users.module.css"

export default function RevokeSessionButton({ userId, userName }: { userId: string, userName: string }) {
    const [loading, setLoading] = useState(false);

    const handleRevoke = async () => {
        const confirm = window.confirm(`Are you sure you want to FORCE LOGOUT ${userName}? They will be kicked off all devices immediately.`);
        if (!confirm) return;

        setLoading(true);
        const res = await revokeUserSessions(userId);
        setLoading(false);

        if (res.success) {
            alert("Success: User has been logged out.");
        } else {
            alert("Error: " + res.message);
        }
    };

    return (
        <button
            onClick={handleRevoke}
            disabled={loading}
            title="Force Logout (Revoke All Sessions)"
            className={styles.revokeBtn}
        >
            {loading ? <Loader2 className={styles.spin} size={14} /> : <LogOut size={14} />}
            {loading ? "Revoking..." : "Force Logout"}
        </button>
    );
}