import { OrganizationId, Role, RoleId } from '@mosaiq/terrazzo-common/types';
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
        throw new Error('Role not found');
    }
    await deleteRoleDb(roleId);
    return role;
};
