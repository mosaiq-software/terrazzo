import { Router, Request, Response } from "express";
import {addBoard, getWholeBoard} from "@trz-api/board/boardCommon";
import {getBoards} from "@trz-api/persistence/boardPersistence";
import {addList} from "@trz-api/board/listCommon";
import {addCard, editDescription, editName} from "@trz-api/board/cardCommon";

const router = Router();

router.get("/all", getAllBoards);
router.get("/:id", getBoard);

//create tasks
router.post("/create", createBoard)
router.post("/create/list", createList)
router.post("/create/card", createCard)

//update tasks
router.patch("/update/card/description", updateCardDescription)
router.patch("/update/card/name", updateCardName)

/**
 * Gets all boards
 * @param req
 * @param res
 */
async function getBoard(req:Request, res:Response) {
    console.log("Getting board");

    if(!req.params.id) {
        res.status(400).json({message: "Board ID is required"});
        return;
    }

    const boardID = req.params.id;

    try {
        const board = await getWholeBoard(boardID);
        res.status(200).json(board);
    } catch (e: any) {
        res.status(400).json({message: e.message});
    }
}

/**
 * Creates a new board
 * The request body must contain the board name [name] and code [boardCode]
 * The Response will return a 200 code with the ID of the new board on success
 * Otherwise, a 400 error will be returned
 * @param req
 * @param res
 */
async function createBoard(req:Request, res:Response) {
    console.log("Creating board");

    if(!req.body.name || !req.body.boardCode) {
        res.status(400).json({message: "Board name and code are required"});
        return;
    }

    try {
        const boardID = await addBoard(req.body.name, req.body.boardCode);
        res.status(200).json({boardId: boardID});
    } catch (e: any) {
        console.log("Error creating board");
        res.status(400).json({message: e.message});
    }
}

/**
 * Creates a new list
 * The Request body must contain the board ID [boardId] and the list name [name]
 * The Response will return a 200 code with the ID of the new list on success
 * Otherwise, a 400 error will be returned
 * @param req
 * @param res
 */
async function createList(req:Request, res:Response) {
    console.log("Creating list");

    if(!req.body.name || !req.body.boardId) {
        res.status(400).json({message: "Board ID and list name are required"});
        return;
    }

    try {
        const listID = await addList(req.body.boardId, req.body.name);
        res.status(200).json({listId: listID});
    } catch (e: any) {
        console.log("Error creating List");
        res.status(400).json({message: e.message});
    }
}

/**
 * Creates a new card
 * The Request body must contain the list ID [listId] and the card name [name]
 * The Response will return a 200 code the ID of the new card on success
 * Otherwise, a 400 error will be returned
 * @param req
 * @param res
 */
async function createCard(req:Request, res:Response) {
    console.log("Creating card");

    if(!req.body.name || !req.body.listId) {
        res.status(400).json({message: "List ID and card name are required"});
        return;
    }

    try {
        const cardID = await addCard(req.body.listId, req.body.name);
        res.status(200).json({cardId: cardID});
    } catch (e: any) {
        console.log("Error creating Card");
        res.status(400).json({message: e.message});
    }
}

/**
 * Gets all boards
 * @param req
 * @param res
 */
async function getAllBoards(req:Request, res:Response) {
    console.log("Getting all boards");
    try {
        const boards = await getBoards();
        res.status(200).json(boards);
    } catch (e: any) {
        console.log("Error getting all boards");
        res.status(400).json({message: e.message});
    }
}

/**
 * Updates the description of a card
 * The Request body must contain the card ID [cardId] and the new description [description]
 * The Response will return a 200 code on success
 * Otherwise, a 400 error will be returned with the error message
 * @param req
 * @param res
 */
async function updateCardDescription(req:Request, res:Response) {
    console.log("Updating card description");

    if(!req.body.cardId || !req.body.description) {
        res.status(400).json({message: "Card ID and description are required"});
        return;
    }

    try {
        await editDescription(req.body.cardId, req.body.description);
        res.status(200).json({message: "Description updated"});
    } catch (e: any) {
        console.log("Error updating card description");
        res.status(400).json({message: e.message});
    }
}

/**
 * Updates the name of a card
 * The Request body must contain the card ID [cardId] and the new name [description]
 * The Response will return a 200 code on success
 * Otherwise, a 400 error will be returned with the error message
 * @param req
 * @param res
 */
async function updateCardName(req:Request, res:Response) {
    console.log("Updating card name");

    if(!req.body.cardId || !req.body.name) {
        res.status(400).json({message: "Card ID and name are required"});
        return;
    }

    try {
        await editName(req.body.cardId, req.body.name);
        res.status(200).json({message: "Name updated"});
    } catch (e: any) {
        console.log("Error updating card name");
        res.status(400).json({message: e.message});
    }
}



export default router;