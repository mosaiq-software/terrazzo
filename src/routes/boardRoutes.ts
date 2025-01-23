import { Router, Request, Response } from "express";
import {getWholeBoard} from "@trz-api/board/boardCommon";

const router = Router();

router.get("/:id", getBoard);
//router.use("/create", )

async function getBoard(req:Request, res:Response) {
    const boardID = req.params.id;

    try {
        const board = await getWholeBoard(boardID);
        res.status(200).json(board);
    } catch (e) {
        res.status(404).json({message: e});
    }
}



export default router;