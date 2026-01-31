import { BoardId, CardId, ListHeader, ListId, updateBaseFromPartial } from '@mosaiq/terrazzo-common';
import { syncAddList, syncMoveList, syncUpdateListField } from '@trz-api/broadcasters';
import { getCardIdsOnList } from '@trz-api/controllers/cardController';
import {
    createListOnBoardDb,
    getActiveListCountOnBoard,
    getActiveListsByBoardIdOrderDb,
    getListByIdDb,
    moveListDb,
    updateListDb,
} from '@trz-api/persistence/listPersistence';

export async function getListAndCardIdsOnBoard(boardID: BoardId): Promise<{ listId: ListId; cardIds: CardId[] }[]> {
    const listHeaders = await getActiveListsByBoardIdOrderDb(boardID);
    if (listHeaders == null) {
        return [];
    }
    const res: { listId: ListId; cardIds: CardId[] }[] = [];
    for (const li of listHeaders) {
        const r = {
            listId: li.id,
            cardIds: await getCardIdsOnList(li.id, false),
        };
        res.push(r);
    }
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
export async function addList(list: Partial<ListHeader> & { boardId: BoardId }, options?: AddListOptions) {
    try {
        const newList: ListHeader = {
            id: crypto.randomUUID(),
            boardId: list.boardId,
            name: list.name || '',
            archived: list.archived || false,
            order: await getActiveListCountOnBoard(list.boardId),
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
    const updatingList = await getListByIdDb(listId);
    if (updatingList == null) {
        throw new Error('List not found');
    }

    const updated = updateBaseFromPartial(updatingList, partial);
    try {
        await updateListDb(updated.id, updated);
        await syncUpdateListField(updated.id, partial, updated.boardId);
    } catch (e: any) {
        throw new Error('Failed to update list ' + e);
    }
}

//Utils

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
export async function moveList(listId: ListId, toPosition: number, onBoardId: BoardId, options?: MoveListOptions) {
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
