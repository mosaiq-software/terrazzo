import express from 'express';
import idRouter from "@trz-api/board/idRoute";

const router = express.Router();

router.use("/:id", idRouter)
router.use("/create", )


export default router;