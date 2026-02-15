export enum PermissionFlagCategory {
    ORG_LEVEL = 'ORG_LEVEL',
    MODULE_LEVEL = 'MODULE_LEVEL',
    OTHER = 'OTHER',
}

export interface PermissionFlagCategoryData {
    title: string;
}

export const PermissionFlagCategoryData: Record<PermissionFlagCategory, PermissionFlagCategoryData> = {
    [PermissionFlagCategory.ORG_LEVEL]: {
        title: 'Organization Permissions',
    },
    [PermissionFlagCategory.MODULE_LEVEL]: {
        title: 'Module Permissions',
    },
    [PermissionFlagCategory.OTHER]: {
        title: 'Miscellaneous Permissions',
    },
};
