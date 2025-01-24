import {Board, Card, List, Priority} from "@mosaiq/terrazzo-common/dist/types";
import {createBoard, getBoardById, getBoardMembers, updateBoard} from "@trz-api/persistence/boardPersistence";
import {
    createListOnBoard,
    getListById,
    getListsByBoardIdDown,
    getNextListOrder,
} from "@trz-api/persistence/listPersistence";
import {getLabelsByBoardId} from "@trz-api/persistence/labelPersistence";
import {createCardOnList, getCardsByListIdDown, getNextCardOrder} from "@trz-api/persistence/cardPersistence";

//Gets
export async function getWholeBoard(boardID:string) {
    //pull board from db with ID
    const board = await getBoardById(boardID);

    if(board == null) {
        throw new Error("Board not found");
    }

    try {
        board.lists = await getAllListsOfBoard(boardID);
        board.members = await getBoardMembers(boardID);
        board.sprints = [];
        board.labels = await getLabelsByBoardId(boardID);

        return board;
    } catch (e) {
        throw new Error("Failed to retrieve board" + e);
    }
}

export async function getAllListsOfBoard(boardID:string) {

    const lists = await getListsByBoardIdDown(boardID);

    if(lists == null) {
        return [];
    }

    for (const list of lists) {
        list.cards = await getCardsByListIdDown(list.id);
    }

    try {
        return lists;
    } catch (e) {
        throw new Error("Failed to retrieve board" + e);
    }

}

//Creates
export async function addBoard(name:string, boardCode:string) {

    const newBoard: Board = {
        id:"",
        boardCode:"",
        name:"",
        lists:[],
        members:[],
        sprints:[],
        labels:[],
        archived:false,
        createdAt:0,
        totalCards:0};

    if(name.length > 50) {
        throw new Error("Title must be 50 characters or less");
    }

    if(boardCode.length > 3) {
        throw new Error("Abbreviation must be 3 characters or less");
    }

    newBoard.id = crypto.randomUUID();
    newBoard.boardCode = boardCode;
    newBoard.name = name;
    newBoard.totalCards = 0;
    newBoard.createdAt = Date.now();

    try{
        await createBoard(newBoard);
        return newBoard.id;
    }catch (e) {
        throw new Error("Failed to save board" + e);
    }
}

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

    console.log(newListOrder);

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
        return newList.id;
    }catch (e) {
        throw new Error("Failed to save board" + e);
    }
}

export async function addCard(listID:string, cardName:string) {
    //pull board from db with ID
    const updatingList = await getListById(listID);

    if (updatingList == null) {
        throw new Error("Board not found");
    }

    const board = await getBoardById(updatingList.boardId);

    if (board == null) {
        throw new Error("Board not found");
    }

    if(updatingList.cards && updatingList.cards.length > 50) {
        throw new Error("List cannot have more than 50 cards");
    }

    const newCard: Card = {
        id:crypto.randomUUID(),
        cardNumber:board.boardCode + "-" + (board.totalCards + 1),
        name:cardName,
        description:"",
        priority:Priority.LOWEST,
        storyPoints:0,
        sprintId:"",
        assignees:[],
        comments:[],
        checklists:[],
        labels:[],
        timesheetEntries:[],
        archived:false,
        order:await getNextCardOrder(listID)
    };

    //save board before returning
    //add try statement for error handling
    try {
        await createCardOnList(newCard, listID).then(async () => {
            board.totalCards++;
            await updateBoard(board);
        });
        return newCard.id;
    }catch (e) {
        throw new Error("Failed to save Card" + e);
    }
}

//Updates
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