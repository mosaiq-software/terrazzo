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
    MANAGE_OTHERS_ROLES = 'MANAGE_OTHERS_ROLES',
    MANAGE_OWN_ROLES = 'MANAGE_OWN_ROLES',
    MANAGE_INVITES = 'MANAGE_INVITES',
    KICK_MEMBERS = 'KICK_MEMBERS',

    // Module level permissions
    VIEW_MODULE = 'VIEW_MODULE',
    EDIT_MODULE = 'EDIT_MODULE',
    DELETE_MODULE = 'DELETE_MODULE',

    // Board permissions
    MOVE_CARDS = 'MOVE_CARDS',
    EDIT_CARDS = 'EDIT_CARDS',
    DELETE_CARDS = 'DELETE_CARDS',
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
    [PermissionFlag.MANAGE_OTHERS_ROLES]: {
        flag: PermissionFlag.MANAGE_OTHERS_ROLES,
        title: "Manage Others' Roles",
        description: 'Ability to manage roles of other members within the organization.',
        category: PermissionFlagCategory.ORG_LEVEL,
    },
    [PermissionFlag.MANAGE_OWN_ROLES]: {
        flag: PermissionFlag.MANAGE_OWN_ROLES,
        title: 'Manage Own Roles',
        description: 'Ability to manage your own roles within the organization.',
        category: PermissionFlagCategory.ORG_LEVEL,
    },
    [PermissionFlag.MANAGE_INVITES]: {
        flag: PermissionFlag.MANAGE_INVITES,
        title: 'Manage Invites',
        description: 'Ability to send and manage invitations to the organization.',
        category: PermissionFlagCategory.ORG_LEVEL,
    },
    [PermissionFlag.KICK_MEMBERS]: {
        flag: PermissionFlag.KICK_MEMBERS,
        title: 'Kick Members',
        description: 'Ability to remove members from the organization.',
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
        description: 'Ability to edit the basic contents of a module',
        category: PermissionFlagCategory.MODULE_LEVEL,
    },
    [PermissionFlag.DELETE_MODULE]: {
        flag: PermissionFlag.DELETE_MODULE,
        title: 'Delete Module',
        description: 'Ability to delete a module',
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
    [PermissionFlag.DELETE_CARDS]: {
        flag: PermissionFlag.DELETE_CARDS,
        title: 'Delete Cards',
        description: 'Ability to delete/archive a card from a board',
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
