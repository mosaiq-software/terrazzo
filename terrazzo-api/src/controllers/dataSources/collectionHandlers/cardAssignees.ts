import { CollectionSource, CollectionSourceHandler } from '@mosaiq/terrazzo-common';

// TODO: Implement CardAssignees editable collection handler
export const cardAssigneesCollectionHandler: CollectionSourceHandler<CollectionSource.CardAssignees> = {
    read: async () => {
        throw new Error('CardAssignees collection handler not implemented');
    },
    add: async () => {
        throw new Error('CardAssignees collection handler not implemented');
    },
    remove: async () => {
        throw new Error('CardAssignees collection handler not implemented');
    },
};
