import { CollectionSource, List, ObjectSource } from '@mosaiq/terrazzo-common';
import { syncCollectionSource } from '@trz-api/broadcasters';
import {
    createListOnBoardDb,
    getActiveListCountOnBoard,
    getListByIdDb,
    updateListDb,
} from '@trz-api/persistence/listPersistence';
import { objectSourceHandlers } from '../dataSourceWrapper';

export const listHandler = objectSourceHandlers(ObjectSource.List, {
    create: async (data, options) => {
        const newList: List = {
            id: crypto.randomUUID(),
            boardId: data.boardId,
            name: data.name || '',
            order: data.order !== undefined ? data.order : await getActiveListCountOnBoard(data.boardId),
        };
        await createListOnBoardDb(newList);
        if (!options?.preventSync) {
            try {
                await syncCollectionSource(data.boardId, CollectionSource.Lists);
            } catch (e) {
                console.error(`Failed to sync new list collection source`, {
                    boardId: data.boardId,
                    error: e,
                });
            }
        }
        return newList.id;
    },
    update: async (id, data) => {
        await updateListDb(id, data);
    },
    read: async (id) => {
        return (await getListByIdDb(id)) || undefined;
    },
});
