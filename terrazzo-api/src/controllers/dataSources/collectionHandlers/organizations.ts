import { CollectionSource } from '@mosaiq/terrazzo-common';
import { getOrgIdsByUserIdDb } from '@trz-api/persistence/organizationMembershipPersistence';
import { collectionSourceReadHandlers } from '../dataSourceWrapper';

export const organizationsCollectionHandler = collectionSourceReadHandlers(CollectionSource.Organizations, {
    read: async (parentId) => {
        return await getOrgIdsByUserIdDb(parentId);
    },
});
