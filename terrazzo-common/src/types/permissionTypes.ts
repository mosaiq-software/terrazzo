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

    // Board permissions
    VIEW_BOARD = 'VIEW_BOARD',
    EDIT_BOARD = 'EDIT_BOARD',
    CREATE_BOARD = 'CREATE_BOARD',
    MOVE_CARDS = 'MOVE_CARDS',
    EDIT_CARDS = 'EDIT_CARDS',
    CREATE_CARDS = 'CREATE_CARDS',

    // Document permissions
    VIEW_DOCUMENT = 'VIEW_DOCUMENT',
    EDIT_DOCUMENT = 'EDIT_DOCUMENT',
    CREATE_DOCUMENT = 'CREATE_DOCUMENT',
}
export enum PermissionFlagCategory {
    ORG_LEVEL = 'ORG_LEVEL',
    BOARD_LEVEL = 'BOARD_LEVEL',
    DOCUMENT_LEVEL = 'DOCUMENT_LEVEL',
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
        title: 'Manage Roles',
        description: 'Ability to create and edit roles and their permissions',
        category: PermissionFlagCategory.ORG_LEVEL,
    },
    [PermissionFlag.ASSIGN_ROLES]: {
        flag: PermissionFlag.ASSIGN_ROLES,
        title: 'Assign Roles',
        description: 'Ability to assign roles to users within the organization',
        category: PermissionFlagCategory.ORG_LEVEL,
    },

    // Board permissions
    [PermissionFlag.VIEW_BOARD]: {
        flag: PermissionFlag.VIEW_BOARD,
        title: 'View Board',
        description: 'Ability to view a board and its contents',
        category: PermissionFlagCategory.BOARD_LEVEL,
    },
    [PermissionFlag.EDIT_BOARD]: {
        flag: PermissionFlag.EDIT_BOARD,
        title: 'Edit Board',
        description: 'Ability to edit a board and its lists',
        category: PermissionFlagCategory.BOARD_LEVEL,
    },
    [PermissionFlag.CREATE_BOARD]: {
        flag: PermissionFlag.CREATE_BOARD,
        title: 'Create Board',
        description: 'Ability to create new boards',
        category: PermissionFlagCategory.BOARD_LEVEL,
    },
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
    [PermissionFlag.CREATE_CARDS]: {
        flag: PermissionFlag.CREATE_CARDS,
        title: 'Create Cards',
        description: 'Ability to create new cards on a board',
        category: PermissionFlagCategory.BOARD_LEVEL,
    },

    // Document permissions
    [PermissionFlag.VIEW_DOCUMENT]: {
        flag: PermissionFlag.VIEW_DOCUMENT,
        title: 'View Document',
        description: 'Ability to view a document',
        category: PermissionFlagCategory.DOCUMENT_LEVEL,
    },
    [PermissionFlag.EDIT_DOCUMENT]: {
        flag: PermissionFlag.EDIT_DOCUMENT,
        title: 'Edit Document',
        description: 'Ability to edit a document',
        category: PermissionFlagCategory.DOCUMENT_LEVEL,
    },
    [PermissionFlag.CREATE_DOCUMENT]: {
        flag: PermissionFlag.CREATE_DOCUMENT,
        title: 'Create Document',
        description: 'Ability to create new documents',
        category: PermissionFlagCategory.DOCUMENT_LEVEL,
    },
};
export interface PermissionFlagCategoryData {
    title: string;
}
export const PermissionFlagCategoryData: Record<PermissionFlagCategory, PermissionFlagCategoryData> = {
    [PermissionFlagCategory.ORG_LEVEL]: {
        title: 'Organization Permissions',
    },
    [PermissionFlagCategory.BOARD_LEVEL]: {
        title: 'Board Permissions',
    },
    [PermissionFlagCategory.DOCUMENT_LEVEL]: {
        title: 'Document Permissions',
    },
    [PermissionFlagCategory.OTHER]: {
        title: 'Miscellaneous Permissions',
    },
};
