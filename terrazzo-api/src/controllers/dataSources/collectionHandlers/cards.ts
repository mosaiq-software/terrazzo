import { CollectionSource } from '@mosaiq/terrazzo-common';
import { getActiveCardIdsOnListDb } from '@trz-api/persistence/cardPersistence';
import { collectionSourceReadHandlers } from '../dataSourceWrapper';

export const cardsCollectionHandler = collectionSourceReadHandlers(CollectionSource.Cards, {
    read: async (parentId) => {
        return await getActiveCardIdsOnListDb(parentId);
    },
});
