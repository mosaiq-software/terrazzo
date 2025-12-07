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

    // Module level permissions
    [PermissionFlag.VIEW_MODULE]: {
        flag: PermissionFlag.VIEW_MODULE,
        title: 'View Module',
        description: 'Ability to view modules',
        category: PermissionFlagCategory.MODULE_LEVEL,
    },
    [PermissionFlag.EDIT_MODULE]: {
        flag: PermissionFlag.EDIT_MODULE,
        title: 'Edit Module',
        description: 'Ability to create and edit modules',
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
