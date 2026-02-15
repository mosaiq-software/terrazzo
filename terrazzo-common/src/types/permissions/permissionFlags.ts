import { PermissionFlagCategory } from './permissionCategories';

export enum PermissionFlag {
    // Org level permissions
    ADMINISTER_ORG = 'ADMINISTER_ORG',
    EDIT_ROLES = 'EDIT_ROLES',
    ASSIGN_ROLES = 'ASSIGN_ROLES',

    // Module permissions
    VIEW_MODULES = 'VIEW_MODULES',
    MANAGE_MODULES = 'MANAGE_MODULES',
    MANAGE_CARDS = 'MANAGE_CARDS',
}

export interface PermissionFlagData {
    flag: PermissionFlag;
    title: string;
    description: string;
    category?: PermissionFlagCategory;
}
export const PermissionFlagData: Record<PermissionFlag, PermissionFlagData> = {
    // Org level permissions
    [PermissionFlag.ADMINISTER_ORG]: {
        flag: PermissionFlag.ADMINISTER_ORG,
        title: 'Administer Organization',
        description: 'Full access to all organization settings and management.',
        category: PermissionFlagCategory.ORG_LEVEL,
    },
    [PermissionFlag.EDIT_ROLES]: {
        flag: PermissionFlag.EDIT_ROLES,
        title: 'Manage Roles',
        description: 'Create and edit roles and their permissions',
        category: PermissionFlagCategory.ORG_LEVEL,
    },
    [PermissionFlag.ASSIGN_ROLES]: {
        flag: PermissionFlag.ASSIGN_ROLES,
        title: 'Assign Roles',
        description: 'Assign roles to users within the organization',
        category: PermissionFlagCategory.ORG_LEVEL,
    },

    // Module permissions
    [PermissionFlag.VIEW_MODULES]: {
        flag: PermissionFlag.VIEW_MODULES,
        title: 'View Modules',
        description: 'View modules and their contents',
        category: PermissionFlagCategory.MODULE_LEVEL,
    },
    [PermissionFlag.MANAGE_MODULES]: {
        flag: PermissionFlag.MANAGE_MODULES,
        title: 'Manage Modules',
        description: 'Create, edit, and archive modules',
        category: PermissionFlagCategory.MODULE_LEVEL,
    },
    [PermissionFlag.MANAGE_CARDS]: {
        flag: PermissionFlag.MANAGE_CARDS,
        title: 'Manage Cards',
        description: 'Create, edit, move, and archive cards',
        category: PermissionFlagCategory.MODULE_LEVEL,
    },
};
