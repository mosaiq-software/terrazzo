import { MembershipRecord, ModuleHeader, ModuleHeaderWithChildren, OrganizationHeader, OrganizationId, OrgMembershipLevel, PermissionLevel, TrzModuleType, UserId } from '@mosaiq/terrazzo-common/types';
import { calculateEffectivePermissions } from '@mosaiq/terrazzo-common/utils/permissionUtils';
import { getModulesByOrgIdDb } from '@trz-api/persistence/modulePersistence';
import { deleteOrganizationMembership, getOrganizationMembershipsForOrg, getOrganizationMembershipsForUser, updateOrganizationMembership, upsertOrganizationMembership } from '@trz-api/persistence/organizationMembershipPersistence';
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

export const upsertMembership = async (membershipRecord: MembershipRecord) => {
    return await upsertOrganizationMembership(membershipRecord);
};

export const updateMembership = async (userId: UserId, orgId: OrganizationId, newLevel: OrgMembershipLevel) => {
    const record: MembershipRecord = {
        userId,
        orgId,
        permissionLevel: newLevel,
    };
    await updateOrganizationMembership(record);
};

export const removeMembership = async (userId: UserId, orgId: OrganizationId) => {
    await deleteOrganizationMembership(userId, orgId);
};

/**
 * Builds the full directory tree for the org, calculating effective permissions for all modules.
 * An "Effective Permission" is the highest permission a user could have on a module, considering inherited permissions from parent modules.
 */
const getOrgFullDirectoryTree = async (org: OrganizationHeader, orgMembershipRecord: MembershipRecord[]): Promise<ModuleHeaderWithChildren> => {
    // get all admins in the org and give them ADMIN permissions on the root directory
    const orgAdminRecords = orgMembershipRecord.filter((rec) => rec.permissionLevel === OrgMembershipLevel.ADMIN);
    const userPermissionLevels: Record<UserId, PermissionLevel> = {};
    for (const rec of orgAdminRecords) {
        userPermissionLevels[rec.userId] = PermissionLevel.ADMIN;
    }
    const orgFakeModuleHeader: ModuleHeader = {
        id: org.id,
        parentId: '-----',
        name: org.name,
        archived: false,
        createdAt: org.createdAt,
        orgId: org.id,
        type: TrzModuleType.Organization,
        anyonePermissionLevel: null,
        orgPermissionLevel: null,
        userPermissionLevels: userPermissionLevels,
    };
    const allModules = await getModulesByOrgIdDb(org.id);
    const effectiveModules = calculateEffectivePermissions(allModules, orgFakeModuleHeader);
    return { ...orgFakeModuleHeader, children: effectiveModules };
};

/**
 * Trims the directory tree to only include modules the user has at least VIEW permission on.
 * @param rootModule The root of the directory tree to trim
 * @param userId The ID of the user for whom the tree is being trimmed
 * @param isInOrg Whether the user is a member of the organization
 * @returns The trimmed directory tree, or null if the user has no access to the root module
 */
const trimDirectoryTreeForUser = (rootModule: ModuleHeaderWithChildren, userId: UserId, isInOrg: boolean): ModuleHeaderWithChildren | null => {
    /**
     * Determines if the user has at least VIEW permission on the given module
     */
    const userHasAccess = (module: ModuleHeaderWithChildren): boolean => {
        const userLevel = module.userPermissionLevels[userId] ?? PermissionLevel.NONE;
        const orgLevel = isInOrg ? (module.orgPermissionLevel ?? PermissionLevel.NONE) : PermissionLevel.NONE;
        const anyoneLevel = module.anyonePermissionLevel ?? PermissionLevel.NONE;
        const maxLevel = Math.max(userLevel, orgLevel, anyoneLevel);
        return maxLevel >= PermissionLevel.VIEW;
    };

    /**
     * Recursively trims the directory tree for the user
     */
    const recursivelyTrim = (module: ModuleHeaderWithChildren): ModuleHeaderWithChildren | null => {
        if (!userHasAccess(module) && module.type !== TrzModuleType.Organization) {
            return null;
        }
        if (!module.children || module.children.length === 0) {
            return { ...module, children: [] };
        }
        const trimmedChildren: ModuleHeaderWithChildren[] = [];
        for (const child of module.children) {
            const trimmedChild = recursivelyTrim(child);
            if (trimmedChild) {
                trimmedChildren.push(trimmedChild);
            }
        }
        return { ...module, children: trimmedChildren };
    };
    return recursivelyTrim(rootModule);
};

/**
 * For each userId in userIds, returns the org directory tree trimmed to only include modules they have at least VIEW permission on.
 * This handles multiple users efficiently by calculating the full effective permission tree once, and then trimming it for each user.
 */
export const getOrgDirectoryTreeForUsers = async (orgId: OrganizationId, userIds: UserId[]): Promise<Record<UserId, ModuleHeaderWithChildren | null>> => {
    const dedupedInputUserIds = Array.from(new Set(userIds));
    const org = await getOrgById(orgId);
    if (!org) {
        throw new Error('Org not found');
    }
    const orgMembershipRecords = await getOrganizationMembershipsForOrg(orgId);
    const orgTree = await getOrgFullDirectoryTree(org, orgMembershipRecords);
    const outputMap: Record<UserId, ModuleHeaderWithChildren | null> = {};
    for (const userId of dedupedInputUserIds) {
        const isInOrg = orgMembershipRecords.some((rec) => rec.userId === userId);
        const trimmedTree = trimDirectoryTreeForUser(orgTree, userId, isInOrg);
        outputMap[userId] = trimmedTree;
    }
    return outputMap;
};

export const getOrgDirectoryTreeForUser = async (orgId: OrganizationId, userId: UserId): Promise<ModuleHeaderWithChildren | null> => {
    return (await getOrgDirectoryTreeForUsers(orgId, [userId]))[userId];
};
