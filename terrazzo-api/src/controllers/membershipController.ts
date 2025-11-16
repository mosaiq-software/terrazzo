import { MembershipRecord, OrganizationId, PermissionLevel, TrzModuleType, UID, UserId } from '@mosaiq/terrazzo-common/types';
import { getBoardById } from '@trz-api/persistence/boardPersistence';
import { getDirectoryByIdDb } from '@trz-api/persistence/directoryPersistence';
import { getDocumentById } from '@trz-api/persistence/documentPersistence';
import { getModulePermissionByModuleId } from '@trz-api/persistence/modulePermissionPersistence';
import { getOrganizationMembershipsForOrg, getOrganizationMembershipsForUser } from '@trz-api/persistence/organizationMembershipPersistence';
import { getOrgById } from '@trz-api/persistence/organizationPersistence';
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

    const usersMembershipRecords = await getOrganizationMembershipsForUser(userId);
    return await recursiveGetModulePermissionsForUser(userId, moduleId, usersMembershipRecords);
};

const recursiveGetModulePermissionsForUser = async (userId: UserId, moduleId: UID, usersMembershipRecords: MembershipRecord[]): Promise<PermissionLevel | null> => {
    const modulePerms = await getModulePermissionByModuleId(moduleId);
    if (!modulePerms) {
        throw new Error(`Permissions for module ${moduleId} not found`);
    }

    // If the user has specific perms, return those
    if (Object.keys(modulePerms.userPermissionLevels).includes(userId)) {
        return modulePerms.userPermissionLevels[userId];
    }

    // If the user is a member of the org, return org-level perms
    const membershipRecordForThisOrg = usersMembershipRecords.find((record) => record.orgId === modulePerms.orgId);
    if (membershipRecordForThisOrg && modulePerms.orgPermissionLevel !== null) {
        return modulePerms.orgPermissionLevel;
    }

    // If the module has anyone level perms, return those
    if (modulePerms.anyonePermissionLevel !== null) {
        return modulePerms.anyonePermissionLevel;
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
        if (!membershipRecordForThisOrg) {
            return null;
        }
        return membershipRecordForThisOrg.permissionLevel;
    }

    // If its not an org, get the parent module ID
    const parentId = unknownModule.module?.parentId;
    if (!parentId) {
        throw new Error(`Module ${moduleId} has no parent module to inherit permissions from`);
    }

    const parentPerms = await recursiveGetModulePermissionsForUser(userId, parentId, usersMembershipRecords);
    return parentPerms;
};

/**
 * A module can be any of a directory, document, or board.
 */
const getUnknownModule = async (moduleId: UID) => {
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
