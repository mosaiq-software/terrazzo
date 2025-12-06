import { OrganizationId, PermissionFlag, Role, RoleId, UserId } from '@mosaiq/terrazzo-common';
import { getRoleIdsForUserInOrgDb, setRoleIdsForUserInOrgDb } from '@trz-api/persistence/roleAssignmentPersistence';
import { createRoleOnOrgDb, deleteRoleDb, getNextRoleOrderDb, getRoleByIdDb, getRolesByOrgIdDb, updateRoleDb } from '@trz-api/persistence/rolePersistence';

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

export const updateRole = async (role: Role) => {
    await updateRoleDb(role);
};

export const deleteRole = async (roleId: RoleId) => {
    const role = await getRoleByIdDb(roleId);
    if (!role) {
        throw new Error(`Role with ID ${roleId} not found`);
    }
    await deleteRoleDb(roleId);
    return role;
};

export const getAllRolePermissionsInOrg = async (orgId: OrganizationId): Promise<Record<RoleId, PermissionFlag[]>> => {
    const roles = await getRolesByOrgIdDb(orgId);
    const rolePermissions: Record<RoleId, PermissionFlag[]> = {};
    for (const role of roles) {
        rolePermissions[role.id] = role.defaultPermissions;
    }
    return rolePermissions;
};

export const setRolesForUserInOrg = async (userId: UserId, orgId: OrganizationId, roleIds: RoleId[]) => {
    await setRoleIdsForUserInOrgDb(userId, orgId, roleIds);
};

export const addRoleToUserInOrg = async (userId: UserId, orgId: OrganizationId, roleId: RoleId) => {
    const currentRoleIds = await getRoleIdsForUserInOrgDb(userId, orgId);
    if (!currentRoleIds.includes(roleId)) {
        currentRoleIds.push(roleId);
        await setRoleIdsForUserInOrgDb(userId, orgId, currentRoleIds);
    }
};

export const removeRoleFromUserInOrg = async (userId: UserId, orgId: OrganizationId, roleId: RoleId) => {
    const currentRoleIds = await getRoleIdsForUserInOrgDb(userId, orgId);
    const updatedRoleIds = currentRoleIds.filter((id) => id !== roleId);
    await setRoleIdsForUserInOrgDb(userId, orgId, updatedRoleIds);
};
