import express from "express";
import { StatusCodes } from "http-status-codes";
import { boardValidation } from "../../validations/boardValidation";
import { boardController } from "../../controllers/boardController";

const Router = express.Router();

Router.route("/")
    .get((req, res) => {
        res.status(StatusCodes.OK).json({
            message: "Get: API get list boards",
        });
    })
    .post(boardValidation.creatNew, boardController.creatNew);

Router.route("/:id")
    .get(boardController.getDetails)
    .put(boardValidation.update, boardController.update);

//API hỗ trọ việc di chuyển card giữa các column khác nhau trogn một board
Router.route("/supports/moving_card").put(
    boardValidation.moveCardToDifferentColumn,
    boardController.moveCardToDifferentColumn
);
export const boardRoute = Router;
