import { getMaxUserRole, OrganizationId, PermissionFlag, Role, RoleId, UserId } from '@mosaiq/terrazzo-common';
import { syncRolesForUserInOrg, syncUpdateOrganizationRoles } from '@trz-api/broadcasters';
import { getRoleIdsForUserInOrgDb, setRoleIdsForUserInOrgDb } from '@trz-api/persistence/roleAssignmentPersistence';
import {
    createRoleOnOrgDb,
    deleteRoleDb,
    getNextRoleOrderDb,
    getRolesByOrgIdDb,
    updateRoleDb,
} from '@trz-api/persistence/rolePersistence';
import { SocketManager } from '@trz-api/utils/socket/socketManager';
import { userIsOrgOwner } from './organizationAccess';

export const getRolesForOrg = async (orgId: OrganizationId) => {
    return await getRolesByOrgIdDb(orgId);
};

export const createRole = async (
    name: string,
    color: string,
    orgId: OrganizationId,
    defaultPermissions: PermissionFlag[] = []
) => {
    const nextOrder = await getNextRoleOrderDb(orgId);
    const role: Role = {
        id: crypto.randomUUID(),
        name,
        color,
        orgId,
        order: nextOrder,
        defaultPermissions: defaultPermissions,
    };
    await createRoleOnOrgDb(role);

    // sync new role to all clients in the org
    const roles = await getRolesForOrg(orgId);
    await syncUpdateOrganizationRoles(orgId, roles);

    return role;
};

export const updateRole = async (role: Role, updatedBy: UserId) => {
    const userRoles = await getUserRolesInOrg(updatedBy, role.orgId);
    const maxUserRole = getMaxUserRole(userRoles);
    const userIsOwner = await userIsOrgOwner(updatedBy, role.orgId);
    if (!roleACanManageRoleB(maxUserRole, role, userIsOwner)) {
        throw new Error('User cannot update a role with equal or higher order than their maximum role');
    }

    await updateRoleDb(role);

    const roles = await getRolesForOrg(role.orgId);
    await syncUpdateOrganizationRoles(role.orgId, roles);
};

export const getUserRolesInOrg = async (userId: UserId, orgId: OrganizationId): Promise<Role[]> => {
    const roleIds = await getRoleIdsForUserInOrgDb(userId, orgId);
    return getSpecificRolesInOrg(roleIds, orgId);
};

export const getSpecificRolesInOrg = async (roleIds: RoleId[], orgId: OrganizationId): Promise<Role[]> => {
    const allRoles = await getRolesByOrgIdDb(orgId);
    return allRoles.filter((role) => roleIds.includes(role.id));
};

export const deleteRole = async (role: Role, deletedBy: UserId) => {
    const userRoles = await getUserRolesInOrg(deletedBy, role.orgId);
    const maxUserRole = getMaxUserRole(userRoles);
    const userIsOwner = await userIsOrgOwner(deletedBy, role.orgId);
    if (!roleACanManageRoleB(maxUserRole, role, userIsOwner)) {
        throw new Error('User cannot delete a role with equal or higher order than their maximum role');
    }

    await deleteRoleDb(role.id);

    const roles = await getRolesForOrg(role.orgId);
    await syncUpdateOrganizationRoles(role.orgId, roles);
};

export const validateUserCanAssignRoles = async (
    assigningToUserId: UserId,
    inOrgId: OrganizationId,
    roleIdsToAssign: RoleId[],
    assignedByUserId: UserId
) => {
    const assignedByUserRoles = await getUserRolesInOrg(assignedByUserId, inOrgId);
    const maxAssignedByUserRole = getMaxUserRole(assignedByUserRoles);
    const rolesToAssign = await getSpecificRolesInOrg(roleIdsToAssign, inOrgId);
    const assignerIsOrgOwner = await userIsOrgOwner(assignedByUserId, inOrgId);
    for (const role of rolesToAssign) {
        if (!roleACanManageRoleB(maxAssignedByUserRole, role, assignerIsOrgOwner)) {
            throw new Error('Assigning user cannot assign a role with equal or higher order than their maximum role');
        }
    }
};

/**
 * Returns true if roleA can manage roleB (i.e., roleA's order is less than roleB's order).
 * @param roleA - The role attempting to manage.
 * @param roleB - The role being managed.
 * @returns Whether roleA can manage roleB.
 */
export const roleACanManageRoleB = (
    roleA: Role | undefined,
    roleB: Role | undefined,
    roleAIsOrgOwner: boolean
): boolean => {
    if (roleAIsOrgOwner) {
        // If the user is the org owner, they can manage any role
        return true;
    }
    if (!roleB) {
        // If roleB doesn't exist, treat it as if it has the lowest order
        return true;
    }
    if (!roleA) {
        // If roleA doesn't exist, it can't manage anything
        return false;
    }
    return roleB.order >= roleA.order;
};

export const setRolesForUserInOrg = async (
    userId: UserId,
    orgId: OrganizationId,
    roleIds: RoleId[],
    assignedByUserId: UserId
) => {
    await validateUserCanAssignRoles(userId, orgId, roleIds, assignedByUserId);
    await setRoleIdsForUserInOrgDb(userId, orgId, roleIds);
    await syncRolesForUserInOrg(userId, orgId);
    await SocketManager.syncUserSocketDataForUser(userId);
};
