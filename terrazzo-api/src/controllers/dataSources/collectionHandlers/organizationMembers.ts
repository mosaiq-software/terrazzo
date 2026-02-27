import { CollectionSource } from '@mosaiq/terrazzo-common';
import {
    addMembersToOrgDb,
    getMemberUserIdsByOrgIdDb,
    removeMembersFromOrgDb,
} from '@trz-api/persistence/organizationMembershipPersistence';
import { collectionSourceEditableHandlers } from '../dataSourceWrapper';

export const organizationMembersCollectionHandler = collectionSourceEditableHandlers(
    CollectionSource.OrganizationMembers,
    {
        read: async (parentId) => {
            return await getMemberUserIdsByOrgIdDb(parentId);
        },
        add: async (parentId, itemIds) => {
            await addMembersToOrgDb(parentId, itemIds);
        },
        remove: async (parentId, itemIds) => {
            await removeMembersFromOrgDb(parentId, itemIds);
        },
    }
);
