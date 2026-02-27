import { CollectionSource } from '@mosaiq/terrazzo-common';
import { getRoleIdsByOrgIdDb } from '@trz-api/persistence/rolePersistence';
import { collectionSourceReadHandlers } from '../dataSourceWrapper';

export const rolesCollectionHandler = collectionSourceReadHandlers(CollectionSource.Roles, {
    read: async (parentId) => {
        return await getRoleIdsByOrgIdDb(parentId);
    },
});
