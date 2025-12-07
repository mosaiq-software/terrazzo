import { calculateTrueModulePermissionsInOrg, evaluateOrganizationPermissionForRoles, evaluatePermissionForRoles, meetsRequiredFlags, OrganizationId, PermissionFlag, UID, UserId } from '@mosaiq/terrazzo-common';
import { getModuleById } from '@trz-api/controllers/moduleController';
import { getAllRolePermissionsInOrg } from '@trz-api/controllers/roleController';
import { getRoleIdsForUserInOrgDb } from '@trz-api/persistence/roleAssignmentPersistence';
import { Socket } from 'socket.io';
import { getSocketData } from './socketUtils';

/**
 * Helper to extract UserId from either a UserId or a Socket
 * @param user - The UserId or Socket to extract the UserId from.
 * @returns The extracted UserId.
 */
const getUserId = (user: UserId | Socket): UserId | undefined => {
    if (typeof user === 'string') {
        return user;
    } else {
        const socketData = getSocketData(user);
        return socketData?.user?.user?.id;
    }
};

/**
 * Gets the true effective permissions (org-level-defaults applied) for a user on a module.
 * @param user - The UserId or Socket of the user.
 * @param moduleId - The ID of the module.
 * @returns The list of PermissionFlags that are granted to the user on the module.
 */
const getModulePermissionsForUser = async (user: UserId | Socket, moduleId: UID): Promise<PermissionFlag[]> => {
    const userId = getUserId(user);
    const module = await getModuleById(moduleId);
    if (!module || !userId) {
        return [];
    }
    const userRoles = await getRoleIdsForUserInOrgDb(userId, module.orgId);
    const orgRolePerms = await getAllRolePermissionsInOrg(module.orgId);
    const truePermissions = calculateTrueModulePermissionsInOrg(module.effectivePermissions, orgRolePerms);
    const grantedFlags = evaluatePermissionForRoles(userRoles, truePermissions);
    return grantedFlags;
};

/**
 * Gets the effective organization-level permissions for a user in an organization.
 * @param user - The UserId or Socket of the user.
 * @param orgId - The ID of the organization.
 * @returns The list of PermissionFlags that are granted to the user in the organization.
 */
const getOrganizationPermissionsForUser = async (user: UserId | Socket, orgId: OrganizationId): Promise<PermissionFlag[]> => {
    const userId = getUserId(user);
    if (!userId) {
        return [];
    }
    const userRoles = await getRoleIdsForUserInOrgDb(userId, orgId);
    const orgRolePerms = await getAllRolePermissionsInOrg(orgId);
    const grantedFlags = evaluateOrganizationPermissionForRoles(userRoles, orgRolePerms);
    return grantedFlags;
};

/**
 * Checks if a user has the required permissions on a module.
 * @param user - The UserId or Socket of the user.
 * @param moduleId - The ID of the module.
 * @param requiredFlags - The list of required PermissionFlags (as arrays of alternatives). @see meetsRequiredFlags
 * @returns Whether the user has the required permissions on the module.
 */
export const userHasPermissionOnModule = async (user: UserId | Socket, moduleId: UID, requiredFlags: PermissionFlag[][]): Promise<boolean> => {
    const grantedFlags = await getModulePermissionsForUser(user, moduleId);
    return meetsRequiredFlags(grantedFlags, requiredFlags);
};

/**
 * Checks if a user has the required permissions on an organization.
 * @param user - The UserId or Socket of the user.
 * @param orgId - The ID of the organization.
 * @param requiredFlags - The list of required PermissionFlags (as arrays of alternatives). @see meetsRequiredFlags
 * @returns Whether the user has the required permissions on the organization.
 */
export const userHasPermissionsOnOrganization = async (user: UserId | Socket, orgId: OrganizationId, requiredFlags: PermissionFlag[][]): Promise<boolean> => {
    const grantedFlags = await getOrganizationPermissionsForUser(user, orgId);
    return meetsRequiredFlags(grantedFlags, requiredFlags);
};

/**
 * Checks if a user can administer an organization.
 * ```
 * has any of:
 * - ADMINISTER_ORG.
 * ```
 */
export const userCanAdministerOrganization = async (user: UserId | Socket, orgId: UID): Promise<boolean> => {
    return userHasPermissionsOnOrganization(user, orgId, [[PermissionFlag.ADMINISTER_ORG]]);
};

/**
 * Checks if a user can view or edit a module.
 * ```
 * has any of:
 * - ADMINISTER_ORG
 * - VIEW_MODULE
 * ```
 */
export const userCanViewModule = async (user: UserId | Socket, moduleId: UID): Promise<boolean> => {
    return userHasPermissionOnModule(user, moduleId, [[PermissionFlag.ADMINISTER_ORG], [PermissionFlag.VIEW_MODULE]]);
};

/**
 * Checks if a user can edit a module.
 * ```
 * has any of:
 * - ADMINISTER_ORG
 * - VIEW_MODULE and EDIT_MODULE
 * ```
 */
export const userCanEditModule = async (user: UserId | Socket, moduleId: UID): Promise<boolean> => {
    return userHasPermissionOnModule(user, moduleId, [[PermissionFlag.ADMINISTER_ORG], [PermissionFlag.VIEW_MODULE, PermissionFlag.EDIT_MODULE]]);
};

/**
 * Checks if a user can move cards on a board.
 * ```
 * has any of:
 * - ADMINISTER_ORG
 * - VIEW_MODULE and MOVE_CARDS and EDIT_CARDS
 * ```
 */
export const userCanMoveCardsOnBoard = async (user: UserId | Socket, moduleId: UID): Promise<boolean> => {
    return userHasPermissionOnModule(user, moduleId, [[PermissionFlag.ADMINISTER_ORG], [PermissionFlag.VIEW_MODULE, PermissionFlag.MOVE_CARDS]]);
};

/**
 * Checks if a user can edit cards on a board.
 * ```
 * has any of:
 * - ADMINISTER_ORG
 * - VIEW_MODULE and EDIT_CARDS
 * ```
 */
export const userCanEditCardsOnBoard = async (user: UserId | Socket, moduleId: UID): Promise<boolean> => {
    return userHasPermissionOnModule(user, moduleId, [[PermissionFlag.ADMINISTER_ORG], [PermissionFlag.VIEW_MODULE, PermissionFlag.EDIT_CARDS]]);
};
