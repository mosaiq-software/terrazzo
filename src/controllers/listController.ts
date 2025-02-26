import {
    createListOnBoard,
    getListById,
    getListsBoardId,
    getListsByBoardIdOrder,
    getNextListOrder, updateList,
    updateListOrder
} from "@trz-api/persistence/listPersistence";
import {getBoardById} from "@trz-api/persistence/boardPersistence";
import {BoardId, List, ListId} from "@mosaiq/terrazzo-common/types";
import {getAllCardsOfList} from "@trz-api/controllers/cardController";
import { arrayMove, updateBaseFromPartial } from "@mosaiq/terrazzo-common/utils/arrayUtils";

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

export async function updateListFromPartial(listId: ListId, partial:Partial<List>) {
    const updatingList = await getListById(listId);
    if (updatingList == null) {
        throw new Error("List not found");
    }

    const updated = updateBaseFromPartial<List>(updatingList, partial);
    try {
        await updateList(updated);
    } catch (e:any) {
        throw new Error("Failed to update list "+e);
    }
}

//Utils

export async function getBoardIDFromListID(listID:ListId) {
    const updatingList = await getListById(listID);

    if (updatingList == null) {
        throw new Error("List not found");
    }

    return updatingList.boardId;
}
export async function moveList(listID: string, toPosition: number) {
    try {
        const boardId = await getListsBoardId(listID);
        if(!boardId){
            throw new Error("No board found for list");
        }
        const lists = await getListsByBoardIdOrder(boardId);
        if(!lists){
            throw new Error("No lists found on board");
        }
        const index = lists.findIndex((l)=>l.id === listID);
        if(index < 0){
            throw new Error("List not found in list")
        }
        const movedLists = arrayMove<List>(lists, index, toPosition);
        await updateListOrder(movedLists);
    } catch (error: any) {
        console.error(error);
        throw error;
    }
}