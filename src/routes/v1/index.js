import express from "express";
import { StatusCodes } from "http-status-codes";
import { boardRoute } from "./boardRoute";
import { columnRoute } from "./columnRoute";
import { cardRoute } from "./cardRoute";

const Router = express.Router();

// Check API v1/status
Router.get("/status", (req, res) => {
    res.status(StatusCodes.OK).json({ message: "API V1 are ready to use" });
});

//Board API
Router.use("/boards", boardRoute);

//Column API
Router.use("/columns", columnRoute);

//Card API
Router.use("/cards", cardRoute);

export const APIs_V1 = Router;
