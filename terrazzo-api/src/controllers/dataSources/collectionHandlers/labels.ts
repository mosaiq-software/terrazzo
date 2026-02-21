import { CollectionSource, CollectionSourceHandler } from '@mosaiq/terrazzo-common';
import { getLabelIdsByBoardIdDb } from '@trz-api/persistence/labelPersistence';

export const labelsCollectionHandler: CollectionSourceHandler<CollectionSource.Labels> = {
    read: async (parentId) => {
        return await getLabelIdsByBoardIdDb(parentId);
    },
    add: async () => {
        throw new Error('CollectionSource.Labels does not support add; create labels via ObjectSource.Label');
    },
    remove: async () => {
        throw new Error('CollectionSource.Labels does not support remove; delete labels via label controller');
    },
};
