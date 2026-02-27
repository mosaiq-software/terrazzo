import { CollectionSource, CollectionSourceHandler } from '@mosaiq/terrazzo-common';
import { getActiveCardIdsOnListDb } from '@trz-api/persistence/cardPersistence';

export const cardsCollectionHandler: CollectionSourceHandler<CollectionSource.Cards> = {
    read: async (parentId) => {
        return await getActiveCardIdsOnListDb(parentId);
    },
};
