import {Board} from "@mosaiq/terrazzo-common/types";
import {createBoard, getBoardById, getBoardMembers} from "@trz-api/persistence/boardPersistence";
import {getLabelsByBoardId} from "@trz-api/persistence/labelPersistence";
import {getAllListsOfBoard} from "@trz-api/board/listController";

//Gets

/**
 * Gets a board by its ID
 * Returns a promise of the type Board with all its lists, members, sprints, and labels
 * @param boardID
 */
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

//Creates

/**
 * Adds a new board to the database
 * You must pass in the board name and code
 * Returns the ID of the new board
 * @param name
 * @param boardCode
 */
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
        totalCards:0
    };

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

//Updates