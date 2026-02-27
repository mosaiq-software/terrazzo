import { CollectionSource, CollectionSourceHandler } from '@mosaiq/terrazzo-common';
import { getActiveListIdsByBoardIdOrderDb } from '@trz-api/persistence/listPersistence';

export const listsCollectionHandler: CollectionSourceHandler<CollectionSource.Lists> = {
    read: async (parentId) => {
        return await getActiveListIdsByBoardIdOrderDb(parentId);
    },
};
