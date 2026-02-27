import { CollectionSource, CollectionSourceHandler } from '@mosaiq/terrazzo-common';
import { getRoleIdsByOrgIdDb } from '@trz-api/persistence/rolePersistence';

export const rolesCollectionHandler: CollectionSourceHandler<CollectionSource.Roles> = {
    read: async (parentId) => {
        return await getRoleIdsByOrgIdDb(parentId);
    },
};
