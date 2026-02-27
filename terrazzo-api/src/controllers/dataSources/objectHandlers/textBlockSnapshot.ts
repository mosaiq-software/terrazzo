import { CollectionSource, ObjectSource, TextBlockSnapshot } from '@mosaiq/terrazzo-common';
import {
    createTextBlockHistorySnapshotDb,
    getTextBlockHistorySnapshotDb,
    updateTextBlockHistorySnapshotDb,
} from '@trz-api/persistence/textBlockHistoryPersistence';
import { objectSourceHandlers } from '../dataSourceWrapper';
import { syncCollectionSource } from '@trz-api/broadcasters';

export const textBlockSnapshotHandler = objectSourceHandlers(ObjectSource.TextBlockSnapshot, {
    create: async (data, options) => {
        const snapshot: TextBlockSnapshot = {
            snapshotId: crypto.randomUUID(),
            textBlockId: data.textBlockId,
            timestamp: Date.now(),
            content: data.content,
            tags: data.tags,
        };
        await createTextBlockHistorySnapshotDb(snapshot);

        if (!options?.preventSync) {
            try {
                await syncCollectionSource(data.textBlockId, CollectionSource.TextBlockSnapshots);
            } catch (e) {
                console.error(`Failed to sync new text block snapshot collection source`, {
                    textBlockId: data.textBlockId,
                    error: e,
                });
            }
        }

        return snapshot.snapshotId;
    },
    update: async (id, data) => {
        await updateTextBlockHistorySnapshotDb(id, data);
    },
    read: async (id) => {
        return (await getTextBlockHistorySnapshotDb(id)) || undefined;
    },
});
