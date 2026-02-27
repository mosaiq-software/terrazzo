import { CollectionSource } from '@mosaiq/terrazzo-common';
import { getLabelIdsByBoardIdDb } from '@trz-api/persistence/labelPersistence';
import { collectionSourceReadHandlers } from '../dataSourceWrapper';

export const labelsCollectionHandler = collectionSourceReadHandlers(CollectionSource.Labels, {
    read: async (parentId) => {
        return await getLabelIdsByBoardIdDb(parentId);
    },
});
