import express from "express";
import { cardController } from "../../controllers/cardController";
import { cardValidation } from "../../validations/cardValidation";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { multerUpLoadMiddleware } from "../../middlewares/multerUploadMiddleware";

const Router = express.Router();

Router.route("/").post(
    authMiddleware.isAuthorized,
    cardValidation.createNew,
    cardController.createNew
);

Router.route("/:id")
    .put(
        authMiddleware.isAuthorized,
        multerUpLoadMiddleware.upload.single("cardCover"),
        cardValidation.update,
        cardController.update
    )
    .delete(
        authMiddleware.isAuthorized,
        cardValidation.deleteItem,
        cardController.deleteItem
    );
export const cardRoute = Router;
