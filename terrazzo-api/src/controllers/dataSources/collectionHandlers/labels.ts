import { CollectionSource, CollectionSourceHandler } from '@mosaiq/terrazzo-common';
import { getLabelIdsByBoardIdDb } from '@trz-api/persistence/labelPersistence';

export const labelsCollectionHandler: CollectionSourceHandler<CollectionSource.Labels> = {
    read: async (parentId) => {
        return await getLabelIdsByBoardIdDb(parentId);
    },
};
