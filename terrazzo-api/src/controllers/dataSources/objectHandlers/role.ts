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
        await updateRoleDb(id, data);
    },
    read: async (id) => {
        return (await getRoleByIdDb(id)) || undefined;
    },
});
