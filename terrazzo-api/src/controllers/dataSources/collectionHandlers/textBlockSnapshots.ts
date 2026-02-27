import { CollectionSource } from '@mosaiq/terrazzo-common';
import { getTextBlockSnapshotIdsByTextBlockIdDb } from '@trz-api/persistence/textBlockHistoryPersistence';
import { collectionSourceReadHandlers } from '../dataSourceWrapper';

export const textBlockSnapshotsCollectionHandler = collectionSourceReadHandlers(CollectionSource.TextBlockSnapshots, {
    read: async (parentId) => {
        return await getTextBlockSnapshotIdsByTextBlockIdDb(parentId);
    },
});
