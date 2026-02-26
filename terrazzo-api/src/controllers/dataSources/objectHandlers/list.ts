import { List, ObjectSource, ObjectSourceHandler } from '@mosaiq/terrazzo-common';
import { syncAddList, syncUpdateListField } from '@trz-api/broadcasters';
import {
    createListOnBoardDb,
    getActiveListCountOnBoard,
    getListByIdDb,
    updateListDb,
} from '@trz-api/persistence/listPersistence';

export const listHandler: ObjectSourceHandler<ObjectSource.List> = {
    create: async (data, options) => {
        try {
            const newList: List = {
                id: crypto.randomUUID(),
                boardId: data.boardId,
                name: data.name || '',
                order: data.order !== undefined ? data.order : await getActiveListCountOnBoard(data.boardId),
            };
            await createListOnBoardDb(newList);
            if (!options?.preventSync) {
                await syncAddList(newList, data.boardId);
            }
            return newList.id;
        } catch (error) {
            throw new Error('Failed to save board' + error);
        }
    },
    update: async (id, data, options) => {
        const partial: Partial<List> = { ...data };
        try {
            if (partial.order !== undefined) {
                delete partial.order;
            }
            await updateListDb(id, partial);
        } catch (error: any) {
            throw new Error('Failed to update list ' + error);
        }
        if (!options?.preventSync) {
            try {
                const updated = await getListByIdDb(id);
                if (!updated) {
                    throw new Error('List not found after update ' + id);
                }
                await syncUpdateListField(updated.id, partial, updated.boardId);
            } catch (error: any) {
                throw new Error('Failed to sync updated list ' + error);
            }
        }
    },
    read: async (id) => {
        return (await getListByIdDb(id)) || undefined;
    },
};
