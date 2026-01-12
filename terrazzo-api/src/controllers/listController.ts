import { arrayMove, BoardId, CardId, List, ListHeader, ListId, updateBaseFromPartial } from '@mosaiq/terrazzo-common';
import { syncAddList, syncMoveList, syncUpdateListField } from '@trz-api/broadcasters';
import { getAllCardsOfList, getCardIdsOnList } from '@trz-api/controllers/cardController';
import { getBoardByIdDb } from '@trz-api/persistence/boardPersistence';
import {
    createListOnBoardDb,
    getListByIdDb,
    getListsBoardIdDb,
    getListsByBoardIdOrderDb,
    getNextListOrderDb,
    updateListDb,
    updateListOrderDb,
} from '@trz-api/persistence/listPersistence';

//Gets

/**
 * Gets all lists of a board by board ID
 * Returns a promise of all lists with all their cards
 * @param boardID
 * @param archived
 */
export async function getAllListsOfBoard(boardID: BoardId, archived: boolean) {
    let listHeaders = await getListsByBoardIdOrderDb(boardID, archived);

    if (listHeaders == null) {
        return [];
    }

    listHeaders = listHeaders.filter((l) => !l.archived);

    const lists: List[] = await Promise.all(
        listHeaders.map(async (l) => {
            return {
                ...l,
                cards: await getAllCardsOfList(l.id, false),
            };
        })
    );

    try {
        return lists;
    } catch (e) {
        throw new Error('Failed to retrieve board' + e);
    }
}

export async function getListAndCardIdsOnBoard(
    boardID: BoardId,
    archived: boolean
): Promise<{ listId: ListId; cardIds: CardId[] }[]> {
    const listHeaders = await getListsByBoardIdOrderDb(boardID, archived);
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
export async function addList(boardID: BoardId, listName: string) {
    //pull board from db with ID
    const updatingBoard = await getBoardByIdDb(boardID);

    if (updatingBoard == null) {
        throw new Error('Board not found');
    }

    try {
        const newList: List = {
            id: crypto.randomUUID(),
            boardId: boardID,
            name: listName,
            archived: false,
            cards: [],
            order: await getNextListOrderDb(boardID),
        };
        await createListOnBoardDb(newList, boardID);
        await syncAddList(newList, boardID);
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
        await updateListDb(updated);
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
export async function moveList(listID: ListId, toPosition: number) {
    try {
        const boardId = await getListsBoardIdDb(listID);
        if (!boardId) {
            throw new Error('No board found for list');
        }
        const lists = await getListsByBoardIdOrderDb(boardId, false); //assumes as of now that archived lists are not included
        if (!lists) {
            throw new Error('No lists found on board');
        }
        const index = lists.findIndex((l) => l.id === listID);
        if (index < 0) {
            throw new Error('List not found in list');
        }
        const movedLists = arrayMove<ListHeader>(lists, index, toPosition);
        await updateListOrderDb(movedLists);
        await syncMoveList(listID, toPosition, boardId);
    } catch (error: any) {
        console.error(error);
        throw error;
    }
}
