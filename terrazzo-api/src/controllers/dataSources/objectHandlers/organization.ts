import { ObjectSource, OrganizationHeader } from '@mosaiq/terrazzo-common';
import { createOrgDb, getOrgByIdDb, updateOrgDb } from '@trz-api/persistence/organizationPersistence';
import { objectSourceHandlers } from '../dataSourceWrapper';

export const organizationHandler = objectSourceHandlers(ObjectSource.Organization, {
    create: async (data) => {
        const newOrg: OrganizationHeader = {
            id: crypto.randomUUID(),
            name: data.name?.trim(),
            createdAt: Date.now(),
            logoUrl: data.logoUrl || '',
            description: data.description || '',
            ownerId: data.ownerId,
        };
        await createOrgDb(newOrg);
        return newOrg.id;
    },
    update: async (id, data) => {
        await updateOrgDb(id, data);
    },
    read: async (id) => {
        return (await getOrgByIdDb(id)) || undefined;
    },
});
