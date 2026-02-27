import {
    MAX_NAME_LENGTH,
    ObjectSource,
    OrganizationHeader,
    PermissionFlag,
    recordValues,
} from '@mosaiq/terrazzo-common';
import { createOrganizationMembershipDb } from '@trz-api/persistence/organizationMembershipPersistence';
import { createOrgDb, getOrgByIdDb, updateOrgDb } from '@trz-api/persistence/organizationPersistence';
import { setRoleIdsForUserInOrgDb } from '@trz-api/persistence/roleAssignmentPersistence';
import { objectSourceHandlers } from '../dataSourceWrapper';
import { roleHandler } from './role';

export const organizationHandler = objectSourceHandlers(ObjectSource.Organization, {
    create: async (data) => {
        const name = data.name.trim();
        if (name.length === 0 || name.length > MAX_NAME_LENGTH) {
            throw new Error(`Name must be 1 - ${MAX_NAME_LENGTH} characters`);
        }

        const newOrg: OrganizationHeader = {
            id: crypto.randomUUID(),
            name: name,
            createdAt: Date.now(),
            logoUrl: data.logoUrl || '',
            description: data.description || '',
            ownerId: data.ownerId,
        };
        await createOrgDb(newOrg);

        // Assign membership to creator
        const orgMembershipRecord = {
            orgId: newOrg.id,
            userId: newOrg.ownerId,
            joinedAt: Date.now(),
        };
        await createOrganizationMembershipDb(orgMembershipRecord);

        // create default roles
        const adminRoleId = await roleHandler.create({
            name: 'Admin',
            color: '#D31757',
            orgId: newOrg.id,
            defaultPermissions: recordValues(PermissionFlag),
        });
        const guestRoleId = await roleHandler.create({
            name: 'Guest',
            color: '#2384CA',
            orgId: newOrg.id,
            defaultPermissions: [PermissionFlag.VIEW_MODULES],
        });

        // assign admin role to creator
        await setRoleIdsForUserInOrgDb(newOrg.ownerId, newOrg.id, [adminRoleId]);

        return newOrg.id;
    },
    update: async (id, data) => {
        const updatingOrg = await getOrgByIdDb(id);
        if (!updatingOrg) {
            throw new Error('Organization not found');
        }

        await updateOrgDb(id, data);
    },
    read: async (id) => {
        return (await getOrgByIdDb(id)) || undefined;
    },
});
