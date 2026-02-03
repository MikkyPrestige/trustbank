import { UserRole } from "@prisma/client";

// 1. Define the valid actions explicitly
type Action = 'VIEW' | 'EDIT' | 'MONEY' | 'ADMIN_MGMT';

export function canPerform(role: UserRole, action: Action): boolean {

    // 2. Explicitly type the object using 'Record'
    const permissions: Record<UserRole, Action[]> = {
        [UserRole.CLIENT]: [],
        [UserRole.SUPPORT]: ['VIEW', 'EDIT'],
        [UserRole.ADMIN]: ['VIEW', 'EDIT', 'MONEY'],
        [UserRole.SUPER_ADMIN]: ['VIEW', 'EDIT', 'MONEY', 'ADMIN_MGMT'],
    };

    // 3. The check is now type-safe
    const allowedActions = permissions[role];

    if (!allowedActions) return false;

    return allowedActions.includes(action);
}