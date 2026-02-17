'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { logAdminAction } from "@/lib/utils/admin-logger";
import { UserRole } from "@prisma/client";
import { canPerform } from "@/lib/auth/permissions";
import { SYSTEM_DEFINITIONS } from "@/lib/system-definitions";

export async function updateSystemRules(prevState: any, formData: FormData) {
    // 1. Security Check
    const { authorized, session } = await checkAdminAction();
    if (!authorized || !session || !session.user) return { success: false, message: "Unauthorized" };

    // Strict Check: Only Super Admins should touch these rules
    if (!canPerform(session.user.role as UserRole, 'ADMIN_MGMT')) {
        return { success: false, message: "Restricted: Super Admin access required." };
    }

    let changesCount = 0;

    // 2. Loop through our definitions and grab values from FormData
    for (const [key, schema] of Object.entries(SYSTEM_DEFINITIONS)) {
        const rawValue = formData.get(key);
        let finalValue = rawValue as string;

        // Special handling for checkboxes (Boolean)
        if (schema.type === 'BOOLEAN') {
            // Checkboxes send "on" if checked, or null if unchecked
            const isChecked = rawValue === 'on' || rawValue === 'true';
            finalValue = isChecked ? "true" : "false";
        }

        // Only update if value is present
        if (finalValue !== null && finalValue !== undefined) {

            // 🚨 SPECIAL INTERCEPTOR: Auth Login Limit
            // This field lives in the 'SiteSettings' table as an INT, not the KV table.
            if (key === 'auth_login_limit') {
                try {
                    // Update the singleton row in SiteSettings
                    await db.siteSettings.updateMany({
                        data: { auth_login_limit: parseInt(finalValue, 10) }
                    });
                    changesCount++;
                } catch (err) {
                    console.error("Failed to update auth_login_limit", err);
                }
                continue; // 👈 Skip the standard KV upsert below
            }

            // 3. Standard Update for SystemSettings (Key-Value Store)
            await db.systemSettings.upsert({
                where: { key: key },
                update: {
                    value: finalValue,
                    updatedAt: new Date()
                },
                create: {
                    key: key,
                    value: finalValue,
                    group: schema.group,
                    type: schema.type,
                    description: schema.description
                }
            });
            changesCount++;
        }
    }

    try {
        // 4. Log the Critical Action
        await logAdminAction(
            "SYSTEM_SETTINGS_UPDATE",
            "GLOBAL_RULES",
            {
                action: "Updated System Rules",
                count: changesCount,
                admin: session.user.email
            },
            "CRITICAL",
            "SUCCESS"
        );

        revalidatePath("/admin/settings");
        return { success: true, message: "System Rules Updated Successfully" };

    } catch (error) {
        console.error("System Rule Update Error:", error);
        return { success: false, message: "Failed to save system rules" };
    }
}