import { ObjectSource, Role } from '@mosaiq/terrazzo-common';
import {
    createRoleOnOrgDb,
    getNextRoleOrderDb,
    getRoleByIdDb,
    updateRoleDb,
} from '@trz-api/persistence/rolePersistence';
import { objectSourceHandlers } from '../dataSourceWrapper';

export const roleHandler = objectSourceHandlers(ObjectSource.Role, {
    create: async (data) => {
        const order = data.order ?? (await getNextRoleOrderDb(data.orgId));
        const role: Role = {
            id: crypto.randomUUID(),
            name: data.name,
            color: data.color,
            orgId: data.orgId,
            order,
            defaultPermissions: data.defaultPermissions ?? [],
        };
        await createRoleOnOrgDb(role);
        return role.id;
    },
    update: async (id, data) => {
        // const userRoles = await getUserRolesInOrg(updatedBy, role.orgId);
        // const maxUserRole = getMaxUserRole(userRoles);
        // const userIsOwner = await userIsOrgOwner(updatedBy, role.orgId);
        // if (!roleACanManageRoleB(maxUserRole, role, userIsOwner)) {
        //     throw new Error('User cannot update a role with equal or higher order than their maximum role');
        // }

        await updateRoleDb(id, data);
    },
    read: async (id) => {
        return (await getRoleByIdDb(id)) || undefined;
    },
});
