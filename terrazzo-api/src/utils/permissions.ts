import { BoardId, calculateTrueModulePermissionsInOrg, CardId, DirectoryId, DocumentId, evaluateOrganizationPermissionForRoles, evaluatePermissionForRoles, meetsRequiredFlags, OrganizationId, PermissionFlag, UID, UserId } from '@mosaiq/terrazzo-common';
import { getModuleById } from '@trz-api/controllers/moduleController';
import { getAllRolePermissionsInOrg } from '@trz-api/controllers/roleController';
import { getOrganizationMembershipDb } from '@trz-api/persistence/organizationMembershipPersistence';
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
const getModulePermissionsForUser = async (userId: UserId, moduleId: UID): Promise<PermissionFlag[]> => {
    const module = await getModuleById(moduleId);
    if (!module) {
        const orgPerms = await getOrganizationPermissionsForUser(userId, moduleId);
        return orgPerms;
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
const getOrganizationPermissionsForUser = async (userId: UserId, orgId: OrganizationId): Promise<PermissionFlag[]> => {
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
    const userId = getUserId(user);
    if (!userId) {
        return false;
    }
    const grantedFlags = await getModulePermissionsForUser(userId, moduleId);
    console.debug('userHasPermissionOnModule', { userId, moduleId, grantedFlags, requiredFlags });
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
    const userId = getUserId(user);
    if (!userId) {
        return false;
    }
    const grantedFlags = await getOrganizationPermissionsForUser(userId, orgId);
    console.debug('userHasPermissionsOnOrganization', { userId, orgId, grantedFlags, requiredFlags });
    return meetsRequiredFlags(grantedFlags, requiredFlags);
};

// ====================== Specific Permission Checkers ======================

export const userCanGetPersonalDataForUser = async (requestingUser: UserId | Socket, targetUserId: UserId): Promise<boolean> => {
    const requestingUserId = getUserId(requestingUser);
    if (!requestingUserId) {
        return false;
    }
    return requestingUserId === targetUserId;
};

export const userCanViewOrganization = async (user: UserId | Socket, orgId: OrganizationId): Promise<boolean> => {
    const userId = getUserId(user);
    if (!userId) {
        return false;
    }
    const membershipRecord = await getOrganizationMembershipDb(userId, orgId);
    console.log(membershipRecord);
    return !!membershipRecord;
};

export const userCanAdministerOrganization = async (user: UserId | Socket, orgId: OrganizationId): Promise<boolean> => {
    return userHasPermissionsOnOrganization(user, orgId, [[PermissionFlag.ADMINISTER_ORG]]);
};

export const userCanEditRolesInOrganization = async (user: UserId | Socket, orgId: OrganizationId): Promise<boolean> => {
    return userHasPermissionsOnOrganization(user, orgId, [[PermissionFlag.ADMINISTER_ORG], [PermissionFlag.EDIT_ROLES]]);
};

export const userCanAssignRolesInOrganization = async (user: UserId | Socket, orgId: OrganizationId): Promise<boolean> => {
    return userHasPermissionsOnOrganization(user, orgId, [[PermissionFlag.ADMINISTER_ORG], [PermissionFlag.EDIT_ROLES], [PermissionFlag.ASSIGN_ROLES]]);
};

export const userCanViewBoard = async (user: UserId | Socket, boardId: BoardId): Promise<boolean> => {
    return userHasPermissionOnModule(user, boardId, [[PermissionFlag.ADMINISTER_ORG], [PermissionFlag.VIEW_BOARD]]);
};

export const userCanEditBoard = async (user: UserId | Socket, boardId: BoardId): Promise<boolean> => {
    return userHasPermissionOnModule(user, boardId, [[PermissionFlag.ADMINISTER_ORG], [PermissionFlag.EDIT_BOARD]]);
};

export const userCanCreateBoard = async (user: UserId | Socket, boardId: BoardId): Promise<boolean> => {
    return userHasPermissionOnModule(user, boardId, [[PermissionFlag.ADMINISTER_ORG], [PermissionFlag.CREATE_BOARD]]);
};

export const userCanMoveCardsOnBoard = async (user: UserId | Socket, boardId: BoardId): Promise<boolean> => {
    return userHasPermissionOnModule(user, boardId, [[PermissionFlag.ADMINISTER_ORG], [PermissionFlag.MOVE_CARDS]]);
};

export const userCanEditCard = async (user: UserId | Socket, cardId: CardId): Promise<boolean> => {
    return userHasPermissionOnModule(user, cardId, [[PermissionFlag.ADMINISTER_ORG], [PermissionFlag.EDIT_CARDS]]);
};

export const userCanViewDocument = async (user: UserId | Socket, documentId: DocumentId): Promise<boolean> => {
    return userHasPermissionOnModule(user, documentId, [[PermissionFlag.ADMINISTER_ORG], [PermissionFlag.VIEW_DOCUMENT]]);
};

export const userCanEditDocument = async (user: UserId | Socket, documentId: DocumentId): Promise<boolean> => {
    return userHasPermissionOnModule(user, documentId, [[PermissionFlag.ADMINISTER_ORG], [PermissionFlag.EDIT_DOCUMENT]]);
};

export const userCanCreateDocument = async (user: UserId | Socket, documentId: DocumentId): Promise<boolean> => {
    return userHasPermissionOnModule(user, documentId, [[PermissionFlag.ADMINISTER_ORG], [PermissionFlag.CREATE_DOCUMENT]]);
};

export const userCanViewDirectory = async (user: UserId | Socket, directoryId: DirectoryId): Promise<boolean> => {
    return userHasPermissionOnModule(user, directoryId, [[PermissionFlag.ADMINISTER_ORG], [PermissionFlag.VIEW_BOARD], [PermissionFlag.VIEW_DOCUMENT]]);
};

export const userCanEditDirectory = async (user: UserId | Socket, directoryId: DirectoryId): Promise<boolean> => {
    return userHasPermissionOnModule(user, directoryId, [[PermissionFlag.ADMINISTER_ORG], [PermissionFlag.EDIT_BOARD], [PermissionFlag.EDIT_DOCUMENT]]);
};

export const userCanCreateDirectory = async (user: UserId | Socket, directoryId: DirectoryId): Promise<boolean> => {
    return userHasPermissionOnModule(user, directoryId, [[PermissionFlag.ADMINISTER_ORG], [PermissionFlag.CREATE_BOARD], [PermissionFlag.CREATE_DOCUMENT]]);
};
