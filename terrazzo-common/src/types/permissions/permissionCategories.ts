export enum PermissionFlagCategory {
    ORG_LEVEL = 'ORG_LEVEL',
    BOARD_LEVEL = 'BOARD_LEVEL',
    DOCUMENT_LEVEL = 'DOCUMENT_LEVEL',
    OTHER = 'OTHER',
}

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
