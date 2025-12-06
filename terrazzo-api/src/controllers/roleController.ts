import { OrganizationId, PermissionFlag, Role, RoleId } from '@mosaiq/terrazzo-common/types';
import { createRoleOnOrgDb, deleteRoleDb, getRoleByIdDb, getRolesByOrgIdDb, updateRoleDb } from '@trz-api/persistence/rolePersistence';

export const getRolesForOrg = async (orgId: OrganizationId) => {
    return await getRolesByOrgIdDb(orgId);
};

export const createRole = async (name: string, color: string, orgId: OrganizationId) => {
    const role: Role = {
        id: crypto.randomUUID(),
        name,
        color,
        orgId,
        defaultPermissions: [],
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
