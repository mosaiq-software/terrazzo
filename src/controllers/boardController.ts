import {createBoard, getBoardById, updateBoard} from "@trz-api/persistence/boardPersistence";
import {createLabelOnBoard, deleteLabel, deleteLabelingOnCardsByLabelId, deleteLabelsByBoardId, getLabelById, getLabelsByBoardId, updateLabel} from "@trz-api/persistence/labelPersistence";
import {getAllListsOfBoard, getListAndCardIdsOnBoard} from "@trz-api/controllers/listController";
import { Board, BoardHeader, BoardId, BoardRes, Label, LabelId, ProjectId } from "@mosaiq/terrazzo-common/types";
import { updateBaseFromPartial } from "@mosaiq/terrazzo-common/utils/arrayUtils";

//Gets

/**
 * Gets a board by its ID
 * Returns a promise of the type Board with all its lists, members, sprints, and labels
 * @param boardID
 */
export async function getWholeBoard(boardID:BoardId) {
    //pull board from db with ID
    const boardHeader = await getBoardById(boardID);

    if(boardHeader == null) {
        throw new Error("Board not found");
    }

    try {
        const board: Board = {
            ...boardHeader,
            lists: await getAllListsOfBoard(boardID, false), //we dont want archived lists when getting whole board
            labels:  await getLabelsByBoardId(boardID),
            sprints:  [],
        };
        return board;
    } catch (e) {
        throw new Error("Failed to retrieve board" + e);
    }
}


export async function getBoardRes(boardID:BoardId): Promise<BoardRes | undefined> {
    const boardHeader = await getBoardById(boardID);
    if(boardHeader == null) {
        throw new Error("Board not found");
    }

    try {
        const board: BoardRes = {
            ...boardHeader,
            lists: await getListAndCardIdsOnBoard(boardID, false),
            labels: await getLabelsByBoardId(boardID),
        };
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
export async function addBoard(name:string, boardCode:string, projectId:ProjectId) {
    if(name.length > 50) {
        throw new Error("Title must be 50 characters or less");
    }

    const newBoard: Board = {
        id: crypto.randomUUID(),
        projectId,
        boardCode,
        name,
        lists:[],
        sprints:[],
        labels:[],
        archived:false,
        createdAt: Date.now(),
        totalCards:0
    };

    try{
        await createBoard(newBoard);
        return newBoard.id;
    }catch (e) {
        throw new Error("Failed to save board" + e);
    }
}

export async function updateBoardFromPartial(boardId: BoardId, partial:Partial<BoardHeader>) {
    const updatingBoard = await getBoardById(boardId);
    if (updatingBoard == null) {
        throw new Error("Board not found");
    }

    const updated = updateBaseFromPartial<BoardHeader>(updatingBoard, partial);
    try {
        await updateBoard(updated);
    } catch (e:any) {
        throw new Error("Failed to update board "+e);
    }
}

export async function createBoardLabel(boardId:BoardId, name:string, color:string): Promise<Label[]>{
    const label:Label = {
        name,
        color,
        id: crypto.randomUUID(),
    }
    await createLabelOnBoard(label, boardId);
    return await getLabelsByBoardId(boardId);
}

export async function removeBoardLabel(boardId:BoardId, labelId:LabelId): Promise<Label[]>{
    await deleteLabel(labelId);
    await deleteLabelingOnCardsByLabelId(labelId);
    return await getLabelsByBoardId(boardId);
}

export async function updateBoardLabels(boardId:BoardId, updatedLabel:Label): Promise<Label[]>{
    const label = await getLabelById(updatedLabel.id);
    if(!label){
        throw new Error("Label does not exist");
    }

    await updateLabel(updatedLabel);
    return await getLabelsByBoardId(boardId);
}