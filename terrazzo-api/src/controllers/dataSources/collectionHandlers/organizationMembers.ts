import { CollectionSource, CollectionSourceHandler } from '@mosaiq/terrazzo-common';

// TODO: Implement OrganizationMembers editable collection handler
export const organizationMembersCollectionHandler: CollectionSourceHandler<CollectionSource.OrganizationMembers> = {
    read: async () => {
        throw new Error('OrganizationMembers collection handler not implemented');
    },
    add: async () => {
        throw new Error('OrganizationMembers collection handler not implemented');
    },
    remove: async () => {
        throw new Error('OrganizationMembers collection handler not implemented');
    },
};
