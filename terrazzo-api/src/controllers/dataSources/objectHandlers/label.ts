import { ObjectSource, ObjectSourceCreateOptions } from '@mosaiq/terrazzo-common';
import { createLabelOnBoardDb, getLabelByIdDb, updateLabelDb } from '@trz-api/persistence/labelPersistence';

export const labelHandler: ObjectSourceCreateOptions<ObjectSource.Label> = {
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
        const existing = await getLabelByIdDb(id);
        if (!existing) {
            throw new Error(`Label with id ${id} not found`);
        }
        await updateLabelDb({ ...existing, ...data, id });
    },
    read: async (id) => {
        return await getLabelByIdDb(id);
    },
};
