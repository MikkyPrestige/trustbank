import { UserRole } from "@prisma/client";

// valid actions
type Action = 'VIEW' | 'EDIT' | 'MONEY' | 'ADMIN_MGMT';

export function canPerform(role: UserRole, action: Action): boolean {

    const permissions: Record<UserRole, Action[]> = {
        [UserRole.CLIENT]: [],
        [UserRole.SUPPORT]: ['VIEW', 'EDIT'],
        [UserRole.ADMIN]: ['VIEW', 'EDIT', 'MONEY'],
        [UserRole.SUPER_ADMIN]: ['VIEW', 'EDIT', 'MONEY', 'ADMIN_MGMT'],
    };

    const allowedActions = permissions[role];

    if (!allowedActions) return false;

    return allowedActions.includes(action);
}