import { CollectionSource } from '@mosaiq/terrazzo-common';
import {
    addCardAssignmentsForUserDb,
    getCardAssignmentsForUserDb,
    removeCardAssignmentsForUserDb,
} from '@trz-api/persistence/cardAssignmentPersistence';
import { collectionSourceEditableHandlers } from '../dataSourceWrapper';

export const cardAssigneesCollectionHandler = collectionSourceEditableHandlers(CollectionSource.CardAssignees, {
    read: async (parentId) => {
        return await getCardAssignmentsForUserDb(parentId);
    },
    add: async (parentId, itemIds) => {
        await addCardAssignmentsForUserDb(parentId, itemIds);
    },
    remove: async (parentId, itemIds) => {
        await removeCardAssignmentsForUserDb(parentId, itemIds);
    },
});
