import { UserRole } from "@prisma/client";

// 1. Define the valid actions explicitly
type Action = 'VIEW' | 'EDIT' | 'MONEY' | 'ADMIN_MGMT';

export function canPerform(role: UserRole, action: Action): boolean {

    // 2. Explicitly type the object using 'Record'
    // This tells TS: "Every key is a UserRole, and every value is a list of Actions"
    const permissions: Record<UserRole, Action[]> = {
        [UserRole.CLIENT]: [], // TS now knows this is Action[], just empty
        [UserRole.SUPPORT]: ['VIEW', 'EDIT'],
        [UserRole.ADMIN]: ['VIEW', 'EDIT', 'MONEY'],
        [UserRole.SUPER_ADMIN]: ['VIEW', 'EDIT', 'MONEY', 'ADMIN_MGMT'],
    };

    // 3. The check is now type-safe
    const allowedActions = permissions[role];

    // Safety fallback: if role is somehow undefined, return false
    if (!allowedActions) return false;

    return allowedActions.includes(action);
}