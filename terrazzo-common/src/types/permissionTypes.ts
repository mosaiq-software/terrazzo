import { OrganizationId, RoleId } from './genericTypes';

export interface Role {
    id: RoleId;
    orgId: OrganizationId;
    name: string;
    color: string;
    order: number;
    defaultPermissions: PermissionFlag[];
}

export type OverridePermissions = Partial<Record<PermissionFlag, boolean>>;
export type ModulePermissions = Record<RoleId, OverridePermissions>;

export enum PermissionFlag {
    // Org level permissions
    ADMINISTER_ORG = 'ADMINISTER_ORG',
    EDIT_ROLES = 'EDIT_ROLES',
    ASSIGN_ROLES = 'ASSIGN_ROLES',

    // Module level permissions
    VIEW_MODULE = 'VIEW_MODULE',
    EDIT_MODULE = 'EDIT_MODULE',

    // Board permissions
    MOVE_CARDS = 'MOVE_CARDS',
    EDIT_CARDS = 'EDIT_CARDS',
}
export enum PermissionFlagCategory {
    ORG_LEVEL = 'ORG_LEVEL',
    MODULE_LEVEL = 'MODULE_LEVEL',
    BOARD_LEVEL = 'BOARD_LEVEL',

    OTHER = 'OTHER',
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
        title: 'Edit Roles',
        description: 'Ability to create and edit roles within the organization',
        category: PermissionFlagCategory.ORG_LEVEL,
    },
    [PermissionFlag.ASSIGN_ROLES]: {
        flag: PermissionFlag.ASSIGN_ROLES,
        title: 'Assign Roles',
        description: 'Ability to assign roles to users within the organization',
        category: PermissionFlagCategory.ORG_LEVEL,
    },

    // Module level permissions
    [PermissionFlag.VIEW_MODULE]: {
        flag: PermissionFlag.VIEW_MODULE,
        title: 'View Module',
        description: 'Ability to view boards, documents, etc.',
        category: PermissionFlagCategory.MODULE_LEVEL,
    },
    [PermissionFlag.EDIT_MODULE]: {
        flag: PermissionFlag.EDIT_MODULE,
        title: 'Edit Module',
        description: 'Ability to create and edit boards, documents, etc.',
        category: PermissionFlagCategory.MODULE_LEVEL,
    },

    // Board permissions
    [PermissionFlag.MOVE_CARDS]: {
        flag: PermissionFlag.MOVE_CARDS,
        title: 'Move Cards',
        description: 'Ability to move cards within a board',
        category: PermissionFlagCategory.BOARD_LEVEL,
    },
    [PermissionFlag.EDIT_CARDS]: {
        flag: PermissionFlag.EDIT_CARDS,
        title: 'Edit Cards',
        description: 'Ability to edit any field of a card',
        category: PermissionFlagCategory.BOARD_LEVEL,
    },
};
export interface PermissionFlagCategoryData {
    title: string;
}
export const PermissionFlagCategoryData: Record<PermissionFlagCategory, PermissionFlagCategoryData> = {
    [PermissionFlagCategory.ORG_LEVEL]: {
        title: 'Organization Permissions',
    },
    [PermissionFlagCategory.MODULE_LEVEL]: {
        title: 'Any Module Permissions',
    },
    [PermissionFlagCategory.BOARD_LEVEL]: {
        title: 'Board Permissions',
    },
    [PermissionFlagCategory.OTHER]: {
        title: 'Other',
    },
};
