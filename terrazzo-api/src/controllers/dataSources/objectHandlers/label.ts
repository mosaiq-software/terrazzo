import { Label, ObjectSource } from '@mosaiq/terrazzo-common';
import { createLabelOnBoardDb, getLabelByIdDb, updateLabelDb } from '@trz-api/persistence/labelPersistence';
import { objectSourceHandlers } from '../dataSourceWrapper';

export const labelHandler = objectSourceHandlers(ObjectSource.Label, {
    create: async (data) => {
        const label: Label = {
            id: crypto.randomUUID(),
            boardId: data.boardId,
            name: data.name,
            color: data.color,
        };
        await createLabelOnBoardDb(label, data.boardId);
        return label.id;
    },
    update: async (id, data) => {
        await updateLabelDb(id, data);
    },
    read: async (id) => {
        return (await getLabelByIdDb(id)) || undefined;
    },
});
