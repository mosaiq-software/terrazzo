import {
    createListOnBoard,
    getListById,
    getListsBoardId,
    getListsByBoardIdOrder,
    getNextListOrder, updateList,
    updateListOrder
} from "@trz-api/persistence/listPersistence";
import {getBoardById} from "@trz-api/persistence/boardPersistence";
import {Board, List} from "@mosaiq/terrazzo-common/types";
import {getAllCardsOfList} from "@trz-api/controllers/cardController";
import { arrayMove } from "@mosaiq/terrazzo-common/utils/arrayUtils";

//Gets

/**
 * Gets all lists of a board by board ID
 * Returns a promise of all lists with all their cards
 * @param boardID
 */
export async function getAllListsOfBoard(boardID:string) {

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
export async function addList(boardID:string, listName:string) {

    //pull board from db with ID
    const updatingBoard = await getBoardById(boardID);

    if (updatingBoard == null) {
        throw new Error("Board not found");
    }

    if(updatingBoard.lists && updatingBoard.lists.length > 50) {
        throw new Error("Board cannot have more than 50 lists");
    }

    const newListOrder = await getNextListOrder(boardID);

    const newList: List = {
        id:crypto.randomUUID(),
        boardId:boardID,
        name:listName,
        cards:[],
        archived:false,
        order: newListOrder
    };

    //save board before returning
    //add try statement for error handling
    try {
        await createListOnBoard(newList, boardID);
        return newList;
    }catch (e) {
        throw new Error("Failed to save board" + e);
    }
}

//Updates

/**
 * Under construction
 * @param boardID
 * @param newPosition
 */
export function updateListPositions(boardID:string, newPosition:number[]) {
    const updatingBoard: Board = {
        id:"",
        boardCode:"",
        name:"",
        lists:[],
        members:[],
        sprints:[],
        labels:[],
        archived:false,
        createdAt:0,
        totalCards: 0};

    if(newPosition[1] > updatingBoard.lists.length || newPosition[1] < updatingBoard.lists.length) {
        throw new Error("Position out of bounds");
    }

    //save board before returning
    //add try statement for error handling
    try {
        //saving to db
        return true;
    }catch (e) {
        throw new Error("Failed to save board" + e);
    }
}

//Updates

export async function updateListName(listID:string, newName:string) {
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

//Utils

export async function getBoardIDFromListID(listID:string) {
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
        throw error;
    }
}