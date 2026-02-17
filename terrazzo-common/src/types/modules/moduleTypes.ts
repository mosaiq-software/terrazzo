import { ModuleId, OrganizationId, TextBlockId, UserId } from '../genericTypes';
import { ModulePermissions } from '../permissions/permissionTypes';

export enum TrzModule {
    Directory = 'directory',
    Document = 'document',
    Board = 'board',

    /** Technically an org is just a top-level module, but we should never use it as one */
    Organization = 'organization',
}

export interface CreateModuleDataMap {
    [TrzModule.Directory]: {};
    [TrzModule.Document]: {
        createdByUserId: UserId;
    };
    [TrzModule.Board]: {
        boardCode: string;
    };
    [TrzModule.Organization]: never;
}
export type CreateModuleData<T extends TrzModule> = CreateModuleDataMap[T];
export type ModuleType = Exclude<TrzModule, TrzModule.Organization>;
export type CreateModuleDataArgs = {
    [K in ModuleType]: { type: K; initialData: CreateModuleData<K> };
}[ModuleType];

export type UpdateModuleDataArgs = {
    [K in ModuleType]: { type: K; update: Partial<ModuleHeader<K>> };
}[ModuleType];

export interface ModuleDataMap {
    [TrzModule.Directory]: {};
    [TrzModule.Document]: {
        textBlockId: TextBlockId;
        lastModifiedAt: number;
        lastModifiedByUserId: UserId;
    };
    [TrzModule.Board]: {
        boardCode: string;
    };
    [TrzModule.Organization]: never;
}
export type ModuleData<T extends TrzModule> = ModuleDataMap[T];

export interface ModuleHeader<T extends TrzModule = TrzModule> {
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
