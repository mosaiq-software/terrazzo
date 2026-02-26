import { CardId, ListId, ModuleId } from '@mosaiq/terrazzo-common';
import { syncMoveList } from '@trz-api/broadcasters';
import { getActiveCardIdsOnListDb } from '@trz-api/persistence/cardPersistence';
import { getActiveListIdsByBoardIdOrderDb, moveListDb } from '@trz-api/persistence/listPersistence';
import { listHandler } from './dataSources/objectHandlers/list';

export async function getListAndCardIdsOnBoard(boardID: ModuleId): Promise<{ listId: ListId; cardIds: CardId[] }[]> {
    const listIds = await getActiveListIdsByBoardIdOrderDb(boardID);
    const promises = listIds.map(async (li) => {
        return {
            listId: li,
            cardIds: await getActiveCardIdsOnListDb(li),
        };
    });
    const res = await Promise.all(promises);
    return res;
}

export async function getBoardIDFromListID(listID: ListId) {
    const list = await listHandler.read(listID);
    if (!list) {
        throw new Error('List not found');
    }
    return list.boardId;
}

interface MoveListOptions {
    preventSync?: boolean;
}
export async function moveList(
    listId: ListId,
    toPosition: number | null,
    onBoardId: ModuleId,
    options?: MoveListOptions
) {
    try {
        await moveListDb(listId, toPosition);
        if (!options?.preventSync) {
            await syncMoveList(listId, toPosition, onBoardId);
        }
    } catch (error: any) {
        console.error(error);
        throw error;
    }
}
