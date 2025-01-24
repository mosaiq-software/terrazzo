import { Router, Request, Response } from "express";
import {addBoard, addCard, addList, getWholeBoard} from "@trz-api/board/boardCommon";
import {getBoards} from "@trz-api/persistence/boardPersistence";

const router = Router();

router.get("/all", getAllBoards);
router.get("/:id", getBoard);
router.post("/create", createBoard)
router.post("/create/list", createList)
router.post("/create/card", createCard)

async function getBoard(req:Request, res:Response) {
    console.log("Getting board");
    const boardID = req.params.id;

    try {
        const board = await getWholeBoard(boardID);
        res.status(200).json(board);
    } catch (e: any) {
        res.status(404).json({message: e.message});
    }
}

async function createBoard(req:Request, res:Response) {
    console.log("Creating board");
    try {
        const boardID = await addBoard(req.body.name, req.body.boardCode);
        res.status(200).json({boardId: boardID});
    } catch (e: any) {
        console.log("Error creating board");
        res.status(404).json({message: e.message});
    }
}

async function createList(req:Request, res:Response) {
    console.log("Creating list");
    try {
        const listID = await addList(req.body.boardId, req.body.name);
        res.status(200).json({listId: listID});
    } catch (e: any) {
        console.log("Error creating List");
        res.status(404).json({message: e.message});
    }
}

async function createCard(req:Request, res:Response) {
    console.log("Creating card");
    try {
        const cardID = await addCard(req.body.listId, req.body.name);
        res.status(200).json({cardId: cardID});
    } catch (e: any) {
        console.log("Error creating Card");
        res.status(404).json({message: e.message});
    }
}

async function getAllBoards(req:Request, res:Response) {
    console.log("Getting all boards");
    try {
        const boards = await getBoards();
        res.status(200).json(boards);
    } catch (e: any) {
        console.log("Error getting all boards");
        res.status(404).json({message: e.message});
    }
}



export default router;