import { CollectionSource, CollectionSourceHandler } from '@mosaiq/terrazzo-common';
import {
    addMembersToOrgDb,
    getMemberUserIdsByOrgIdDb,
    removeMembersFromOrgDb,
} from '@trz-api/persistence/organizationMembershipPersistence';

export const organizationMembersCollectionHandler: CollectionSourceHandler<CollectionSource.OrganizationMembers> = {
    read: async (parentId) => {
        return await getMemberUserIdsByOrgIdDb(parentId);
    },
    add: async (parentId, itemIds) => {
        await addMembersToOrgDb(parentId, itemIds);
    },
    remove: async (parentId, itemIds) => {
        await removeMembersFromOrgDb(parentId, itemIds);
    },
};
