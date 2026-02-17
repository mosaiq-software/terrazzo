import { ObjectSource, ObjectSourceHandler } from '@mosaiq/terrazzo-common';
import { createLabelOnBoardDb, getLabelByIdDb, updateLabelDb } from '@trz-api/persistence/labelPersistence';

export const labelHandler: ObjectSourceHandler<ObjectSource.Label> = {
    create: async (data) => {
        await createLabelOnBoardDb(
            {
                id: crypto.randomUUID(),
                boardId: data.boardId,
                name: data.name,
                color: data.color,
            },
            data.boardId
        );
    },
    update: async (id, data) => {
        await updateLabelDb(id, data);
    },
    read: async (id) => {
        return await getLabelByIdDb(id);
    },
};
