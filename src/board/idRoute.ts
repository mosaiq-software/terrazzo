import express from "express";

const idRouter = express.Router();

idRouter.post("/", (req, res) => {
    res.send("hello");
});

idRouter.get("/", (req, res) => {
    res.send("hello");
});

export default idRouter;