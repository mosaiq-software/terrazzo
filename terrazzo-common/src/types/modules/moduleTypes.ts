import { OrganizationId, UID } from '../genericTypes';
import { ModulePermissions } from '../permissions/permissionTypes';

export enum TrzModuleType {
    Directory = 'directory',
    Document = 'document',
    Board = 'board',

    /** Technically an org is just a top-level module, but we should never use it as one */
    Organization = 'organization',
}

export interface ModuleHeader {
    id: UID;
    parentId: UID;
    name: string;
    type: TrzModuleType;
    order: number;
    archived: boolean;
    createdAt: number;
    orgId: OrganizationId;
    desiredPermissions: ModulePermissions;
    effectivePermissions: ModulePermissions;
    public: boolean;
}
