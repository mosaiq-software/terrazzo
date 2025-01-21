import {Board, List} from "@mosaiq/terrazzo-common/dist/types";
import {createBoard, getBoardById, getBoardMembers, updateBoard} from "@trz-api/persistence/boardPersistence";
import {getListsByBoardIdDown} from "@trz-api/persistence/listPersistence";
import {getLabelsByBoardId} from "@trz-api/persistence/labelPersistence";

export function createWholeBoard(name:string, boardCode:string) {

    const newBoard: Board = {
        id:"",
        boardCode:boardCode,
        name:name,
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
    newBoard.totalCards = 0;
    newBoard.name = name;
    newBoard.createdAt = Date.now();

    //save board before returning
    //add try statement for error handling

    try{
        return createBoard(newBoard);
    }catch (e) {
        throw new Error("Failed to save board" + e);
    }
}

export async function getWholeBoard(boardID:string) {
    //pull board from db with ID
    const board = await getBoardById(boardID);

    if(board == null) {
        throw new Error("Board not found");
    }

    try {
        board.lists = await getListsByBoardIdDown(boardID);
        board.members = await getBoardMembers(boardID);
        board.sprints = [];
        board.labels = await getLabelsByBoardId(boardID);

        return board;
    } catch (e) {
        throw new Error("Failed to retrieve board" + e);
    }
}

export async function addingList(boardID:string, newLists:List) {

    //pull board from db with ID
    const updatingBoard = await getBoardById(boardID);

    if (updatingBoard == null) {
        throw new Error("Board not found");
    }

    if(updatingBoard.lists.length > 50) {
        throw new Error("Board cannot have more than 50 lists");
    }

    updatingBoard.lists.push(newLists);

    //save board before returning
    //add try statement for error handling
    try {
        await updateBoard(updatingBoard);
        return true;
    }catch (e) {
        throw new Error("Failed to save board" + e);
    }
}

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