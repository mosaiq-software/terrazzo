import { ModuleId, OrganizationId } from '../genericTypes';
import { ModulePermissions } from '../permissions/permissionTypes';

export enum TrzModuleType {
    Directory = 'directory',
    Document = 'document',
    Board = 'board',

    /** Technically an org is just a top-level module, but we should never use it as one */
    Organization = 'organization',
}

export interface ModuleDataMap {
    [TrzModuleType.Directory]: {};
    [TrzModuleType.Document]: {
        textBlockId: string;
        lastModifiedAt: number;
        lastModifiedByUserId: string;
    };
    [TrzModuleType.Board]: {
        boardCode: string;
    };
    [TrzModuleType.Organization]: never;
}

export interface ModuleHeader<T extends TrzModuleType> {
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
    data: ModuleDataMap[T];
}
