import {
    calculateTrueModulePermissionsInOrg,
    evaluateOrganizationPermissionForRoles,
    evaluatePermissionForRoles,
    meetsRequirementsForPermissibleAction,
    ModuleId,
    OrganizationId,
    PermissibleAction,
    PermissionFlag,
    UserId,
} from '@mosaiq/terrazzo-common';
import { getUntypedModuleById } from '@trz-api/controllers/moduleController';
import { getRolesForOrg } from '@trz-api/controllers/roleController';
import { getOrganizationMembershipDb } from '@trz-api/persistence/organizationMembershipPersistence';
import { getOrgByIdDb } from '@trz-api/persistence/organizationPersistence';
import { getRoleIdsForUserInOrgDb } from '@trz-api/persistence/roleAssignmentPersistence';
import { Socket } from 'socket.io';
import { getSocketData } from './socket/socketUtils';

type UserLike = UserId | Socket | undefined;

/**
 * Helper to extract UserId from either a UserId or a Socket
 * @param user - The UserId or Socket to extract the UserId from.
 * @returns The extracted UserId.
 */
const getUserId = (user: UserLike): UserId | undefined => {
    if (!user) {
        return undefined;
    }
    if (typeof user === 'string') {
        return user;
    }
    const socketData = getSocketData(user);
    return socketData?.user?.userId;
};

/**
 * Gets the true effective permissions (org-level-defaults applied) for a user on a module.
 * @param user - The UserId or Socket of the user.
 * @param moduleId - The ID of the module.
 * @returns The list of PermissionFlags that are granted to the user on the module.
 */
const getModulePermissionsForUser = async (userId: UserId, moduleId: ModuleId): Promise<PermissionFlag[]> => {
    const module = await getUntypedModuleById(moduleId);
    if (!module) {
        const orgPerms = await getOrganizationPermissionsForUser(userId, moduleId);
        return orgPerms;
    }
    const userRoles = await getRoleIdsForUserInOrgDb(userId, module.orgId);
    const orgRoles = await getRolesForOrg(module.orgId);
    const org = await getOrgByIdDb(module.orgId);
    const truePermissions = calculateTrueModulePermissionsInOrg(module.effectivePermissions, orgRoles);
    const grantedFlags = evaluatePermissionForRoles(userRoles, truePermissions, !!org && org.ownerId === userId);
    return grantedFlags;
};

/**
 * Gets the effective organization-level permissions for a user in an organization.
 * @param user - The UserId or Socket of the user.
 * @param orgId - The ID of the organization.
 * @returns The list of PermissionFlags that are granted to the user in the organization.
 */
const getOrganizationPermissionsForUser = async (userId: UserId, orgId: OrganizationId): Promise<PermissionFlag[]> => {
    const userRoles = await getRoleIdsForUserInOrgDb(userId, orgId);
    const orgRoles = await getRolesForOrg(orgId);
    const org = await getOrgByIdDb(orgId);
    const grantedFlags = evaluateOrganizationPermissionForRoles(userRoles, orgRoles, !!org && org.ownerId === userId);
    return grantedFlags;
};

/**
 * Checks if a user has the required permissions on a module.
 * @param user - The UserId or Socket of the user.
 * @param moduleId - The ID of the module.
 * @param requiredFlags - The list of required PermissionFlags (as arrays of alternatives). @see meetsRequirementsForPermissibleAction
 * @returns Whether the user has the required permissions on the module.
 */
export const userHasPermissionOnModule = async (
    user: UserLike,
    moduleId: ModuleId,
    permissibleAction: PermissibleAction
): Promise<boolean> => {
    const userId = getUserId(user);
    if (!userId) {
        return false;
    }
    const grantedFlags = await getModulePermissionsForUser(userId, moduleId);
    return meetsRequirementsForPermissibleAction(grantedFlags, permissibleAction);
};

/**
 * Checks if a user has the required permissions on an organization.
 * @param user - The UserId or Socket of the user.
 * @param orgId - The ID of the organization.
 * @param requiredFlags - The list of required PermissionFlags (as arrays of alternatives). @see meetsRequirementsForPermissibleAction
 * @returns Whether the user has the required permissions on the organization.
 */
export const userHasPermissionsOnOrganization = async (
    user: UserLike,
    orgId: OrganizationId,
    permissibleAction: PermissibleAction
): Promise<boolean> => {
    const userId = getUserId(user);
    if (!userId) {
        return false;
    }
    const grantedFlags = await getOrganizationPermissionsForUser(userId, orgId);
    return meetsRequirementsForPermissibleAction(grantedFlags, permissibleAction);
};

// ====================== Specific Permission Checkers ======================

export const userCanGetAndEditPersonalDataForUser = async (
    requestingUser: UserLike,
    targetUserId: UserId
): Promise<boolean> => {
    const requestingUserId = getUserId(requestingUser);
    if (!requestingUserId) {
        return false;
    }
    return requestingUserId === targetUserId;
};

export const userCanViewOrganization = async (user: UserLike, orgId: OrganizationId): Promise<boolean> => {
    const userId = getUserId(user);
    if (!userId) {
        return false;
    }
    const membershipRecord = await getOrganizationMembershipDb(userId, orgId);
    return !!membershipRecord;
};

export const userCanAdministerOrganization = async (user: UserLike, orgId: OrganizationId): Promise<boolean> => {
    return userHasPermissionsOnOrganization(user, orgId, PermissibleAction.AdministerOrg);
};

export const userCanEditRolesInOrganization = async (user: UserLike, orgId: OrganizationId): Promise<boolean> => {
    return userHasPermissionsOnOrganization(user, orgId, PermissibleAction.EditRoles);
};

export const userCanAssignRolesInOrganization = async (user: UserLike, orgId: OrganizationId): Promise<boolean> => {
    return userHasPermissionsOnOrganization(user, orgId, PermissibleAction.AssignRoles);
};

export const userCanViewModule = async (user: UserLike, moduleId: ModuleId): Promise<boolean> => {
    const module = await getUntypedModuleById(moduleId);
    if (!module) {
        return false;
    }
    if (module.public) {
        return true;
    }
    return userHasPermissionOnModule(user, moduleId, PermissibleAction.ViewModules);
};

export const userCanManageModule = async (user: UserLike, moduleId: ModuleId): Promise<boolean> => {
    return userHasPermissionOnModule(user, moduleId, PermissibleAction.ManageModules);
};

export const userCanManageCards = async (user: UserLike, moduleId: ModuleId): Promise<boolean> => {
    return userHasPermissionOnModule(user, moduleId, PermissibleAction.ManageCards);
};
