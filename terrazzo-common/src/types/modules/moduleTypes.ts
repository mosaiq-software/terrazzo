import { ModuleId, OrganizationId, TextBlockId, UserId } from '../genericTypes';
import { ModulePermissions } from '../permissions/permissionTypes';

export enum TrzModuleType {
    Directory = 'directory',
    Document = 'document',
    Board = 'board',

    /** Technically an org is just a top-level module, but we should never use it as one */
    Organization = 'organization',
}

export interface CreateModuleDataMap {
    [TrzModuleType.Directory]: {};
    [TrzModuleType.Document]: {
        createdByUserId: UserId;
    };
    [TrzModuleType.Board]: {
        boardCode: string;
    };
    [TrzModuleType.Organization]: never;
}
export type CreateModuleData<T extends TrzModuleType> = CreateModuleDataMap[T];

export interface ModuleDataMap {
    [TrzModuleType.Directory]: {};
    [TrzModuleType.Document]: {
        textBlockId: TextBlockId;
        lastModifiedAt: number;
        lastModifiedByUserId: UserId;
    };
    [TrzModuleType.Board]: {
        boardCode: string;
    };
    [TrzModuleType.Organization]: never;
}
export type ModuleData<T extends TrzModuleType> = ModuleDataMap[T];

export interface ModuleHeader<T extends TrzModuleType = TrzModuleType> {
    id: ModuleId;
    parentId: ModuleId;
    name: string;
    type: T;
    order: number;
    archived: boolean;
    createdAt: number;
    orgId: OrganizationId;
    desiredPermissions: ModulePermissions;
    effectivePermissions: ModulePermissions;
    public: boolean;
    data: ModuleData<T>;
}
