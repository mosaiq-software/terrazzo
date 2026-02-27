import { CollectionSource, Label, ObjectSource } from '@mosaiq/terrazzo-common';
import { syncCollectionSource } from '@trz-api/broadcasters';
import { createLabelOnBoardDb, getLabelByIdDb, updateLabelDb } from '@trz-api/persistence/labelPersistence';
import { objectSourceHandlers } from '../dataSourceWrapper';

export const labelHandler = objectSourceHandlers(ObjectSource.Label, {
    create: async (data, options) => {
        const label: Label = {
            id: crypto.randomUUID(),
            boardId: data.boardId,
            name: data.name,
            color: data.color,
        };
        await createLabelOnBoardDb(label, data.boardId);
        if (!options?.preventSync) {
            try {
                await syncCollectionSource(data.boardId, CollectionSource.Labels);
            } catch (e) {
                console.error(`Failed to sync new label collection source`, {
                    boardId: data.boardId,
                    error: e,
                });
            }
        }
        return label.id;
    },
    update: async (id, data) => {
        await updateLabelDb(id, data);
    },
    read: async (id) => {
        return (await getLabelByIdDb(id)) || undefined;
    },
});
