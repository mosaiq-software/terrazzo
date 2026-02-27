import { CollectionSource, CollectionSourceHandler } from '@mosaiq/terrazzo-common';

// TODO: Implement RoleAssignments editable collection handler
export const roleAssignmentsCollectionHandler: CollectionSourceHandler<CollectionSource.RoleAssignments> = {
    read: async () => {
        throw new Error('RoleAssignments collection handler not implemented');
    },
    add: async () => {
        throw new Error('RoleAssignments collection handler not implemented');
    },
    remove: async () => {
        throw new Error('RoleAssignments collection handler not implemented');
    },
};
