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
    DUMMY_1 = 'DUMMY_1',
    DUMMY_2 = 'DUMMY_2',
    DUMMY_3 = 'DUMMY_3',
}
export enum PermissionFlagCategory {
    DUMMY = 'DUMMY',
    DUMMY_2 = 'DUMMY_2',

    OTHER = 'OTHER',
}
export interface PermissionFlagData {
    flag: PermissionFlag;
    title: string;
    description: string;
    category?: PermissionFlagCategory;
}
export const PermissionFlagData: Record<PermissionFlag, PermissionFlagData> = {
    [PermissionFlag.DUMMY_1]: {
        flag: PermissionFlag.DUMMY_1,
        title: 'Dummy Permission 1',
        description: 'This is a dummy permission for testing purposes.',
        category: PermissionFlagCategory.DUMMY,
    },
    [PermissionFlag.DUMMY_2]: {
        flag: PermissionFlag.DUMMY_2,
        title: 'Dummy Permission 2',
        description: 'This is another dummy permission for testing purposes.',
        category: PermissionFlagCategory.DUMMY_2,
    },
    [PermissionFlag.DUMMY_3]: {
        flag: PermissionFlag.DUMMY_3,
        title: 'Dummy Permission 3',
        description: 'This is yet another dummy permission for testing purposes.',
        category: PermissionFlagCategory.DUMMY,
    },
};
export interface PermissionFlagCategoryData {
    title: string;
}
export const PermissionFlagCategoryData: Record<PermissionFlagCategory, PermissionFlagCategoryData> = {
    [PermissionFlagCategory.DUMMY]: {
        title: 'Dummy Permissions',
    },
    [PermissionFlagCategory.DUMMY_2]: {
        title: 'Dummy Permissions 2',
    },

    [PermissionFlagCategory.OTHER]: {
        title: 'Other',
    },
};
