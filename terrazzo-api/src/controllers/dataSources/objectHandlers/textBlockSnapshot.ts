import { ObjectSource, TextBlockSnapshot } from '@mosaiq/terrazzo-common';
import {
    createTextBlockHistorySnapshotDb,
    getTextBlockHistorySnapshotDb,
    updateTextBlockHistorySnapshotDb,
} from '@trz-api/persistence/textBlockHistoryPersistence';
import { objectSourceHandlers } from '../dataSourceWrapper';

export const textBlockSnapshotHandler = objectSourceHandlers(ObjectSource.TextBlockSnapshot, {
    create: async (data) => {
        const snapshot: TextBlockSnapshot = {
            snapshotId: crypto.randomUUID(),
            textBlockId: data.textBlockId,
            timestamp: Date.now(),
            content: data.content,
            tags: data.tags,
        };
        await createTextBlockHistorySnapshotDb(snapshot);
        return snapshot.snapshotId;
    },
    update: async (id, data) => {
        await updateTextBlockHistorySnapshotDb(id, data);
    },
    read: async (id) => {
        return (await getTextBlockHistorySnapshotDb(id)) || undefined;
    },
});
