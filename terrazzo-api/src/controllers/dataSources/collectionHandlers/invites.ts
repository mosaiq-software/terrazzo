import { CollectionSource, CollectionSourceHandler } from '@mosaiq/terrazzo-common';
import { getInviteIdsByOrganizationDb } from '@trz-api/persistence/invitePersistence';

export const invitesCollectionHandler: CollectionSourceHandler<CollectionSource.Invites> = {
    read: async (parentId) => {
        return await getInviteIdsByOrganizationDb(parentId);
    },
};
