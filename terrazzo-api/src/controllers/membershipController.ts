import { DirectoryList, DirectoryListItem, MembershipRecord, OrganizationId, PermissionLevel, TrzModule, TrzModuleType, UID, UserId } from '@mosaiq/terrazzo-common/types';
import { getBoardById } from '@trz-api/persistence/boardPersistence';
import { getDirectoryByIdDb } from '@trz-api/persistence/directoryPersistence';
import { getDocumentById } from '@trz-api/persistence/documentPersistence';
import { getModulePermissionByModuleId } from '@trz-api/persistence/modulePermissionPersistence';
import { getOrganizationMembershipsForOrg, getOrganizationMembershipsForUser } from '@trz-api/persistence/organizationMembershipPersistence';
import { getOrgById } from '@trz-api/persistence/organizationPersistence';
import { getModulesInDirectory } from './directoryController';
import { populateMemberships } from './userController';

export const getMembersInOrg = async (orgId: OrganizationId) => {
    const org = await getOrgById(orgId);
    if (org == null) {
        throw new Error('Org not found');
    }
    const records = await getOrganizationMembershipsForOrg(orgId);
    const members = populateMemberships(records);
    return members;
};

export const getOrgsForUser = async (userId: UserId) => {
    const records = await getOrganizationMembershipsForUser(userId);
    const orgIds = records.map((r) => r.orgId);
    const orgs = await Promise.all(orgIds.map(async (id) => await getOrgById(id)));
    return orgs.filter((o) => !!o);
};

export const getModulePermissionsForUser = async (userId: UserId, moduleId: UID) => {
    // Each module at least 2 perms, "Anyone on the internet", "Anyone in organization", ..."Specific users"
    // These can be one of "undefined" (inherit from parent), "view", "edit", "admin"
    // for a user, check:
    // 1. Does this user have a specific permission set on this module? If so, return that. If unset, continue.
    // 2. Is this user a member of the organization that owns this module? If so, return org-level permission. If unset, continue.
    // 3. If there is an "Anyone in organization" permission, return that. If unset, check the parent directory of this module and repeat.
    // If the top level module (the organization) is reached: If the user is a member of the org, return their org-level permission. If not, no access.

    const orgId = await getOrganizationModuleIsIn(moduleId);
    const usersMembershipRecords = await getOrganizationMembershipsForUser(userId);
    const orgMembershipRecord = usersMembershipRecords.find((rec) => rec.orgId === orgId) || null;
    return await recursiveGetModulePermissionsForUser(userId, moduleId, orgMembershipRecord);
};

const recursiveGetModulePermissionsForUser = async (userId: UserId, moduleId: UID, orgMembershipRecord: MembershipRecord | null): Promise<PermissionLevel | null> => {
    const modulePerms = await getModulePermissionByModuleId(moduleId);

    if (modulePerms) {
        // If the user has specific perms, return those
        if (Object.keys(modulePerms.userPermissionLevels).includes(userId)) {
            return modulePerms.userPermissionLevels[userId];
        }

        // If the user is a member of the org, return org-level perms
        if (orgMembershipRecord && modulePerms.orgPermissionLevel !== null) {
            return modulePerms.orgPermissionLevel;
        }

        // If the module has anyone level perms, return those
        if (modulePerms.anyonePermissionLevel !== null) {
            return modulePerms.anyonePermissionLevel;
        }
    }

    // if there are no explicit perms set (all are null), check parent module to inherit from
    const unknownModule = await getUnknownModule(moduleId);
    if (!unknownModule) {
        throw new Error(`Module ${moduleId} not found`);
    }

    // If the module is an organization, we've reached the top level
    // Get the user's membership in the org and return that permission level
    if (unknownModule.type === TrzModuleType.Organization) {
        // User is not a member of the org, no access
        if (!orgMembershipRecord) {
            return null;
        }
        return orgMembershipRecord.permissionLevel;
    }

    // If its not an org, get the parent module ID
    const parentId = unknownModule.module?.parentId;
    if (!parentId) {
        throw new Error(`Module ${moduleId} has no parent module to inherit permissions from`);
    }

    const parentPerms = await recursiveGetModulePermissionsForUser(userId, parentId, orgMembershipRecord);
    return parentPerms;
};

/**
 * A module can be any of a directory, document, or board.
 */
export const getUnknownModule = async (moduleId: UID) => {
    // Start with directories as that is the most likely type when performing membership checks
    const dir = await getDirectoryByIdDb(moduleId);
    if (dir) {
        return { type: TrzModuleType.Directory, module: dir };
    }
    const doc = await getDocumentById(moduleId);
    if (doc) {
        return { type: TrzModuleType.Document, module: doc };
    }
    const board = await getBoardById(moduleId);
    if (board) {
        return { type: TrzModuleType.Board, module: board };
    }
    const org = await getOrgById(moduleId);
    if (org) {
        return { type: TrzModuleType.Organization, module: undefined };
    }
    return null;
};

export const getUserDirectoryStructure = async (userId: UserId, orgId: OrganizationId): Promise<DirectoryList | undefined> => {
    const org = await getOrgById(orgId);
    if (!org) {
        return undefined;
    }

    const directoryList: DirectoryList = [];
    const orgModules = await getModulesInDirectory(orgId);
    for (const module of orgModules) {
        const item = await buildDirectoryListItem(userId, module);
        if (item) {
            directoryList.push(item);
        }
    }

    return directoryList;
};

const buildDirectoryListItem = async (userId: UserId, module: TrzModule): Promise<DirectoryListItem | null> => {
    const moduleId = getModuleId(module);
    const permission = await getModulePermissionsForUser(userId, moduleId);

    if (permission === null) {
        return null;
    }

    // Recursively build directory structure
    if (module.type === TrzModuleType.Directory) {
        const subModules = await getModulesInDirectory(module.directory.id);
        const subItems: DirectoryListItem[] = [];

        for (const subModule of subModules) {
            const subItem = await buildDirectoryListItem(userId, subModule);
            if (subItem) {
                subItems.push(subItem);
            }
        }

        return {
            moduleId: module.directory.id,
            moduleName: module.directory.name,
            moduleType: TrzModuleType.Directory,
            subItems,
        };
    } else if (module.type === TrzModuleType.Document) {
        return {
            moduleId: module.document.id,
            moduleName: module.document.title,
            moduleType: TrzModuleType.Document,
        };
    } else if (module.type === TrzModuleType.Board) {
        return {
            moduleId: module.board.id,
            moduleName: module.board.name,
            moduleType: TrzModuleType.Board,
        };
    }

    return null;
};

export const getModuleId = (module: TrzModule): UID => {
    switch (module.type) {
        case TrzModuleType.Directory:
            return module.directory.id;
        case TrzModuleType.Document:
            return module.document.id;
        case TrzModuleType.Board:
            return module.board.id;
    }
};

/**
 * recursively finds the organization a module is in
 */
export const getOrganizationModuleIsIn = async (moduleId: UID): Promise<OrganizationId> => {
    const unknownModule = await getUnknownModule(moduleId);
    if (!unknownModule) {
        throw new Error(`Module ${moduleId} not found`);
    }
    if (unknownModule.type === TrzModuleType.Organization) {
        return moduleId as OrganizationId;
    }
    const parentId = unknownModule.module?.parentId;
    if (!parentId) {
        throw new Error(`Module ${moduleId} has no parent module to inherit from`);
    }
    return await getOrganizationModuleIsIn(parentId);
};
