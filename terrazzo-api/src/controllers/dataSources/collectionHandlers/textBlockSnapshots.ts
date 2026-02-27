import { CollectionSource, CollectionSourceHandler } from '@mosaiq/terrazzo-common';
import { getTextBlockSnapshotIdsByTextBlockIdDb } from '@trz-api/persistence/textBlockHistoryPersistence';

export const textBlockSnapshotsCollectionHandler: CollectionSourceHandler<CollectionSource.TextBlockSnapshots> = {
    read: async (parentId) => {
        return await getTextBlockSnapshotIdsByTextBlockIdDb(parentId);
    },
};
