import { getMaxUserRole, OrganizationId, PermissionFlag, Role, RoleId, UserId } from '@mosaiq/terrazzo-common';
import { getRoleIdsForUserInOrgDb, setRoleIdsForUserInOrgDb } from '@trz-api/persistence/roleAssignmentPersistence';
import { createRoleOnOrgDb, deleteRoleDb, getNextRoleOrderDb, getRolesByOrgIdDb, updateRoleDb } from '@trz-api/persistence/rolePersistence';

export const getRolesForOrg = async (orgId: OrganizationId) => {
    return await getRolesByOrgIdDb(orgId);
};

export const createRole = async (name: string, color: string, orgId: OrganizationId, defaultPermissions: PermissionFlag[] = []) => {
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
    return role;
};

export const updateRole = async (role: Role, updatedBy: UserId) => {
    const userRoles = await getUserRolesInOrg(updatedBy, role.orgId);
    const maxUserRole = getMaxUserRole(userRoles);
    if (!maxUserRole) {
        throw new Error('User has no roles in the organization');
    }
    if (!roleACanManageRoleB(maxUserRole, role)) {
        throw new Error('User cannot update a role with equal or higher order than their maximum role');
    }

    await updateRoleDb(role);
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
    if (!maxUserRole) {
        throw new Error('User has no roles in the organization');
    }
    if (!roleACanManageRoleB(maxUserRole, role)) {
        throw new Error('User cannot delete a role with equal or higher order than their maximum role');
    }

    await deleteRoleDb(role.id);
};

export const validateUserCanAssignRoles = async (assigningToUserId: UserId, inOrgId: OrganizationId, roleIdsToAssign: RoleId[], assignedByUserId: UserId) => {
    const assignedByUserRoles = await getUserRolesInOrg(assignedByUserId, inOrgId);
    const maxAssignedByUserRole = getMaxUserRole(assignedByUserRoles);
    if (!maxAssignedByUserRole) {
        throw new Error('Assigning user has no roles in the organization');
    }
    const rolesToAssign = await getSpecificRolesInOrg(roleIdsToAssign, inOrgId);
    for (const role of rolesToAssign) {
        if (!roleACanManageRoleB(maxAssignedByUserRole, role)) {
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
export const roleACanManageRoleB = (roleA: Role, roleB: Role): boolean => {
    return roleB.order >= roleA.order;
};

export const setRolesForUserInOrg = async (userId: UserId, orgId: OrganizationId, roleIds: RoleId[], assignedByUserId: UserId) => {
    await validateUserCanAssignRoles(userId, orgId, roleIds, assignedByUserId);
    await setRoleIdsForUserInOrgDb(userId, orgId, roleIds);
};
