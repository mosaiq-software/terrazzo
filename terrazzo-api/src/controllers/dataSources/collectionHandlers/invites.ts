import { CollectionSource } from '@mosaiq/terrazzo-common';
import { getInviteIdsByOrganizationDb } from '@trz-api/persistence/invitePersistence';
import { collectionSourceReadHandlers } from '../dataSourceWrapper';

export const invitesCollectionHandler = collectionSourceReadHandlers(CollectionSource.Invites, {
    read: async (parentId) => {
        return await getInviteIdsByOrganizationDb(parentId);
    },
});
