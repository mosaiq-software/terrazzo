import { CollectionSource } from '@mosaiq/terrazzo-common';
import { getActiveListIdsByBoardIdOrderDb } from '@trz-api/persistence/listPersistence';
import { collectionSourceReadHandlers } from '../dataSourceWrapper';

export const listsCollectionHandler = collectionSourceReadHandlers(CollectionSource.Lists, {
    read: async (parentId) => {
        return await getActiveListIdsByBoardIdOrderDb(parentId);
    },
});
