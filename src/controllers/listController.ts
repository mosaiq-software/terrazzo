import {
    createListOnBoard,
    getListById,
    getListsByBoardIdOrder,
    getNextListOrder, updateList
} from "@trz-api/persistence/listPersistence";
import {getBoardById} from "@trz-api/persistence/boardPersistence";
import {Board, BoardId, List, ListId} from "@mosaiq/terrazzo-common/types";
import {getAllCardsOfList} from "@trz-api/controllers/cardController";

//Gets

/**
 * Gets all lists of a board by board ID
 * Returns a promise of all lists with all their cards
 * @param boardID
 */
export async function getAllListsOfBoard(boardID:BoardId) {

    const lists = await getListsByBoardIdOrder(boardID);

    if(lists == null) {
        return [];
    }

    for (const list of lists) {
        list.cards = await getAllCardsOfList(list.id);
    }

    try {
        return lists;
    } catch (e) {
        throw new Error("Failed to retrieve board" + e);
    }

}

//Creates

/**
 * Adds an empty list to an existing board via the board ID
 * You must pass in the board ID and the list name
 * Returns the ID of the new list
 * @param boardID
 * @param listName
 */
export async function addList(boardID:BoardId, listName:string) {

    //pull board from db with ID
    const updatingBoard = await getBoardById(boardID);

    if (updatingBoard == null) {
        throw new Error("Board not found");
    }

    if(updatingBoard.lists && updatingBoard.lists.length > 50) {
        throw new Error("Board cannot have more than 50 lists");
    }

    try {
        const newList: List = {
            id:crypto.randomUUID(),
            boardId:boardID,
            name:listName,
            cards:[],
            archived:false,
            order: await getNextListOrder(boardID)
        };
        await createListOnBoard(newList, boardID);
        return newList;
    }catch (e) {
        throw new Error("Failed to save board" + e);
    }
}

export async function updateListName(listID:ListId, newName:string) {
    const updatingList = await getListById(listID);

    if (updatingList == null) {
        throw new Error("List not found");
    }

    if(newName.length > 50) {
        throw new Error("Title must be 50 characters or less");
    }

    updatingList.name = newName;

    try {
        await updateList(updatingList);
        return true;
    }catch (e) {
        throw new Error("Failed to save board" + e);
    }
}