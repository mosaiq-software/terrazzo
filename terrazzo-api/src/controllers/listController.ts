import { CardId, ListHeader, ListId, ModuleId } from '@mosaiq/terrazzo-common';
import { syncAddList, syncMoveList, syncUpdateListField } from '@trz-api/broadcasters';
import { getActiveCardIdsOnListDb } from '@trz-api/persistence/cardPersistence';
import {
    createListOnBoardDb,
    getActiveListCountOnBoard,
    getActiveListIdsByBoardIdOrderDb,
    getListByIdDb,
    moveListDb,
    updateListDb,
} from '@trz-api/persistence/listPersistence';

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

export async function getListRes(listId: ListId): Promise<ListHeader | undefined> {
    const listHeader = await getListByIdDb(listId);
    if (listHeader == null) {
        throw new Error('List not found');
    }
    return listHeader;
}

//Creates

/**
 * Adds an empty list to an existing board via the board ID
 * You must pass in the board ID and the list name
 * Returns the ID of the new list
 * @param boardID
 * @param listName
 */
interface AddListOptions {
    preventSync?: boolean;
}
export async function addList(list: Partial<ListHeader> & { boardId: ModuleId }, options?: AddListOptions) {
    try {
        const newList: ListHeader = {
            id: crypto.randomUUID(),
            boardId: list.boardId,
            name: list.name || '',
            order: list.order !== undefined ? list.order : await getActiveListCountOnBoard(list.boardId),
        };
        await createListOnBoardDb(newList);
        if (!options?.preventSync) {
            await syncAddList(newList, list.boardId);
        }
        return newList;
    } catch (e) {
        throw new Error('Failed to save board' + e);
    }
}

export async function updateListFromPartial(listId: ListId, partial: Partial<ListHeader>) {
    try {
        if (partial.order !== undefined) {
            // Do not update order directly
            delete partial.order;
        }
        await updateListDb(listId, partial);
    } catch (e: any) {
        throw new Error('Failed to update list ' + e);
    }
    try {
        const updated = await getListByIdDb(listId);
        if (!updated) {
            throw new Error('List not found after update ' + listId);
        }
        await syncUpdateListField(updated.id, partial, updated.boardId);
    } catch (e: any) {
        throw new Error('Failed to sync updated list ' + e);
    }
}

export async function getBoardIDFromListID(listID: ListId) {
    const updatingList = await getListByIdDb(listID);

    if (updatingList == null) {
        throw new Error('List not found');
    }

    return updatingList.boardId;
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
