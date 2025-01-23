import { Router, Request, Response } from "express";
import {addBoard, addList, getWholeBoard} from "@trz-api/board/boardCommon";
import {getBoards} from "@trz-api/persistence/boardPersistence";

const router = Router();

router.get("/all", getAllBoards);
router.get("/:id", getBoard);
router.post("/create", createBoard)
router.post("/create/list", createList)

async function getBoard(req:Request, res:Response) {
    console.log("Getting board");
    const boardID = req.params.id;

    try {
        const board = await getWholeBoard(boardID);
        res.status(200).json(board);
    } catch (e) {
        res.status(404).json({message: e});
    }
}

async function createBoard(req:Request, res:Response) {
    console.log("Creating board");
    try {
        const boardID = await addBoard(req.body.name, req.body.boardCode);
        res.status(200).json({boardId: boardID});
    } catch (e) {
        console.log("Error creating board");
        res.status(404).json({message: e});
    }
}

async function createList(req:Request, res:Response) {
    console.log("Creating list");
    try {
        const listID = await addList(req.body.name, req.body.boardId);
        res.status(200).json({listId: listID});
    } catch (e) {
        console.log("Error creating List");
        res.status(404).json({message: e});
    }
}

async function getAllBoards(req:Request, res:Response) {
    console.log("Getting all boards");
    try {
        const boards = await getBoards();
        res.status(200).json(boards);
    } catch (e) {
        console.log("Error getting all boards");
        res.status(404).json({message: e});
    }
}



export default router;