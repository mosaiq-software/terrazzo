import { CollectionSource } from '@mosaiq/terrazzo-common';
import { getModuleIdsByOrgIdDb } from '@trz-api/persistence/modulePersistence';
import { collectionSourceReadHandlers } from '../dataSourceWrapper';

export const modulesCollectionHandler = collectionSourceReadHandlers(CollectionSource.Modules, {
    read: async (parentId) => {
        return await getModuleIdsByOrgIdDb(parentId);
    },
});
