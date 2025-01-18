import {BoardType} from "@trz-api/board/boardType";
import {ListType} from "@trz-api/board/lists/listType";

export function createBoard(title:string, abv:string, users:string[]) {

    const newBoard: BoardType = {id:"", abv:"", nextCardNumber: 0, title:"", lists:[], users:[], createdAt:0};
    if(title.length > 50) {
        throw new Error("Title must be 50 characters or less");
    }

    if(abv.length > 3) {
        throw new Error("Abbreviation must be 3 characters or less");
    }

    newBoard.id = crypto.randomUUID();
    newBoard.abv = abv;
    newBoard.nextCardNumber = 1;
    newBoard.title = title;
    newBoard.users.push(...users);
    newBoard.createdAt = Date.now();

    //save board before returning
    //add try statement for error handling

    return {
        board: newBoard
    };
}

export function getBoard(boardID:string) {
    return {
        board: {} as BoardType
    };
}

export function addingList(boardID:string, newLists:ListType) {

    //pull board from db with ID
    const updatingBoard: BoardType = {id:"", abv:"", nextCardNumber: 0, title:"", lists:[], users:[], createdAt:0}; ///TODO: get board from db

    if(updatingBoard.lists.length > 50) {
        throw new Error("Board cannot have more than 50 lists");
    }

    updatingBoard.lists.push(newLists);

    //save board before returning
    //add try statement for error handling
    try {
        //saving to db
        return true;
    }catch (e) {
        throw new Error("Failed to save board" + e);
    }
}

export function updateListPositions(boardID:string, newPosition:number[]) {
    const updatingBoard: BoardType = {id:"", abv:"", nextCardNumber: 0, title:"", lists:[], users:[], createdAt:0}; ///TODO: get board from db


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