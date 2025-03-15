import express from "express";
import { StatusCodes } from "http-status-codes";
import { boardRoute } from "./boardRoute";
const Router = express.Router();

// Check API v1/status
Router.get("/status", (req, res) => {
    res.status(StatusCodes.OK).json({ message: "API V1 are ready to use" });
});

//Board API
Router.use("/boards", boardRoute);

export const APIs_V1 = Router;
