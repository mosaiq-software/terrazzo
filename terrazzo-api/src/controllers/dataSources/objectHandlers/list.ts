import { List, ObjectSource } from '@mosaiq/terrazzo-common';
import {
    createListOnBoardDb,
    getActiveListCountOnBoard,
    getListByIdDb,
    updateListDb,
} from '@trz-api/persistence/listPersistence';
import { objectSourceHandlers } from '../dataSourceWrapper';

export const listHandler = objectSourceHandlers(ObjectSource.List, {
    create: async (data) => {
        const newList: List = {
            id: crypto.randomUUID(),
            boardId: data.boardId,
            name: data.name || '',
            order: data.order !== undefined ? data.order : await getActiveListCountOnBoard(data.boardId),
        };
        await createListOnBoardDb(newList);
        return newList.id;
    },
    update: async (id, data) => {
        await updateListDb(id, data);
    },
    read: async (id) => {
        return (await getListByIdDb(id)) || undefined;
    },
});
