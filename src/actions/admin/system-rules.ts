'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { logAdminAction } from "@/lib/utils/admin-logger";
import { UserRole } from "@prisma/client";
import { canPerform } from "@/lib/auth/permissions";
import { SYSTEM_DEFINITIONS } from "@/lib/system-definitions";

export async function updateSystemRules(prevState: any, formData: FormData) {
    const { authorized, session } = await checkAdminAction();
    if (!authorized || !session || !session.user) return { success: false, message: "Unauthorized" };

    if (!canPerform(session.user.role as UserRole, 'ADMIN_MGMT')) {
        return { success: false, message: "Restricted: Super Admin access required." };
    }

    let changesCount = 0;

    for (const [key, schema] of Object.entries(SYSTEM_DEFINITIONS)) {
        const rawValue = formData.get(key);
        let finalValue = rawValue as string;

        if (schema.type === 'BOOLEAN') {
            const isChecked = rawValue === 'on' || rawValue === 'true';
            finalValue = isChecked ? "true" : "false";
        }

        if (finalValue !== null && finalValue !== undefined) {

            if (key === 'auth_login_limit') {
                try {
                    await db.siteSettings.updateMany({
                        data: { auth_login_limit: parseInt(finalValue, 10) }
                    });
                    changesCount++;
                } catch (err) {
                    console.error("Failed to update auth_login_limit", err);
                }
                continue;
            }

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