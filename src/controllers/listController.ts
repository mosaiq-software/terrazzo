import { createListOnBoard, getListById, getListsBoardId, getListsByBoardIdOrder, getNextListOrder, updateList, updateListOrder } from '@trz-api/persistence/listPersistence';
import { getBoardById } from '@trz-api/persistence/boardPersistence';
import { BoardId, CardId, List, ListHeader, ListId } from '@mosaiq/terrazzo-common/types';
import { getAllCardsOfList, getCardIdsOnList } from '@trz-api/controllers/cardController';
import { arrayMove, updateBaseFromPartial } from '@mosaiq/terrazzo-common/utils/arrayUtils';

//Gets

/**
 * Gets all lists of a board by board ID
 * Returns a promise of all lists with all their cards
 * @param boardID
 * @param archived
 */
export async function getAllListsOfBoard(boardID: BoardId, archived: boolean) {
    let listHeaders = await getListsByBoardIdOrder(boardID, archived);

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

export async function getListAndCardIdsOnBoard(boardID: BoardId, archived: boolean): Promise<{ listId: ListId; cardIds: CardId[] }[]> {
    const listHeaders = await getListsByBoardIdOrder(boardID, archived);
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
    const listHeader = await getListById(listId);
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
    const updatingBoard = await getBoardById(boardID);

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
            order: await getNextListOrder(boardID),
        };
        await createListOnBoard(newList, boardID);
        return newList;
    } catch (e) {
        throw new Error('Failed to save board' + e);
    }
}

export async function updateListFromPartial(listId: ListId, partial: Partial<ListHeader>) {
    const updatingList = await getListById(listId);
    if (updatingList == null) {
        throw new Error('List not found');
    }

    const updated = updateBaseFromPartial<ListHeader>(updatingList, partial);
    try {
        await updateList(updated);
    } catch (e: any) {
        throw new Error('Failed to update list ' + e);
    }
}

//Utils

export async function getBoardIDFromListID(listID: ListId) {
    const updatingList = await getListById(listID);

    if (updatingList == null) {
        throw new Error('List not found');
    }

    return updatingList.boardId;
}
export async function moveList(listID: ListId, toPosition: number) {
    try {
        const boardId = await getListsBoardId(listID);
        if (!boardId) {
            throw new Error('No board found for list');
        }
        const lists = await getListsByBoardIdOrder(boardId, false); //assumes as of now that archived lists are not included
        if (!lists) {
            throw new Error('No lists found on board');
        }
        const index = lists.findIndex((l) => l.id === listID);
        if (index < 0) {
            throw new Error('List not found in list');
        }
        const movedLists = arrayMove<ListHeader>(lists, index, toPosition);
        await updateListOrder(movedLists);
    } catch (error: any) {
        console.error(error);
        throw error;
    }
}
