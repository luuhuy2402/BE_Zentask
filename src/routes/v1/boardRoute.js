import express from "express";
import { boardValidation } from "../../validations/boardValidation";
import { boardController } from "../../controllers/boardController";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { multerUpLoadMiddleware } from "../../middlewares/multerUploadMiddleware";

const Router = express.Router();

Router.route("/")
    .get(authMiddleware.isAuthorized, boardController.getBoards)
    .post(
        authMiddleware.isAuthorized,
        boardValidation.createNew,
        boardController.createNew
    );

Router.route("/:id")
    .get(authMiddleware.isAuthorized, boardController.getDetails)
    .put(
        authMiddleware.isAuthorized,
        multerUpLoadMiddleware.upload.single("boardCover"),
        boardValidation.update,
        boardController.update
    )
    .delete(
        authMiddleware.isAuthorized,
        boardValidation.deleteItem,
        boardController.deleteItem
    );

//API hỗ trọ việc di chuyển card giữa các column khác nhau trogn một board
Router.route("/supports/moving_card").put(
    authMiddleware.isAuthorized,
    boardValidation.moveCardToDifferentColumn,
    boardController.moveCardToDifferentColumn
);
export const boardRoute = Router;
