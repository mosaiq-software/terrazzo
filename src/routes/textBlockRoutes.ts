import { isValidTextBlockEvents } from "@mosaiq/terrazzo-common/utils/textUtils";
import { handleTextBlockEvents } from "@trz-api/controllers/textBlockController";
import { createTextBlock, getAllTextBlockIds, getTextBlockById } from "@trz-api/persistence/textBlockPersistence";
import { Router, Request, Response } from "express";

const router = Router();

router.get("/list", getTextBlockIds);
router.get("/:id", getTextBlock);

router.post("/create", createTextBlockRoute);
router.patch("/update", updateTextBlockRoute);


async function getTextBlockIds(req:Request, res:Response) {
    try {
        const ids = await getAllTextBlockIds();
        res.status(200).json(ids);
    } catch (e: any) {
        res.status(500).json({message: e.message});
    }
}


async function getTextBlock(req:Request, res:Response) {
    if(!req.params.id) {
        res.status(400).json({message: "id is required"});
        return;
    }
    try {
        const textBlock = await getTextBlockById(req.params.id);
        if(!textBlock) {
            res.status(404).json("Text block not found");
            return;
        }
        res.status(200).json(textBlock);
    } catch (e: any) {
        res.status(500).json({message: e.message});
    }
}

async function createTextBlockRoute(req:Request, res:Response) {
    if(!req.body.parentId) {
        res.status(400).json({message: "parentId is required"});
        return;
    }
    try {
        const textBlock = await createTextBlock(req.body.text);
        res.status(200).json(textBlock);
    } catch (e: any) {
        res.status(500).json({message: e.message});
    }
}

async function updateTextBlockRoute(req:Request, res:Response) {
    if(!isValidTextBlockEvents(req.body)) {
        res.status(400).json({message: "id, start, end, and inserted are required"});
        return;
    }
    try {
        const text = await handleTextBlockEvents([{
            id: req.body.id,
            start: req.body.start,
            end: req.body.end,
            inserted: req.body.inserted
        }]);
        res.status(200).json(text);
    } catch (e: any) {
        res.status(500).json({message: e.message});
    }
}

export default router;