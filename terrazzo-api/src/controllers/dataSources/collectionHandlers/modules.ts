import { CollectionSource, CollectionSourceHandler } from '@mosaiq/terrazzo-common';
import { getModuleIdsByOrgIdDb } from '@trz-api/persistence/modulePersistence';

export const modulesCollectionHandler: CollectionSourceHandler<CollectionSource.Modules> = {
    read: async (parentId) => {
        return await getModuleIdsByOrgIdDb(parentId);
    },
};
