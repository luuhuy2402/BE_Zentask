import express from "express";
import { cardController } from "../../controllers/cardController";
import { cardValidation } from "../../validations/cardValidation";
import { authMiddleware } from "../../middlewares/authMiddleware";

const Router = express.Router();

Router.route("/").post(
    authMiddleware.isAuthorized,
    cardValidation.creatNew,
    cardController.creatNew
);

export const cardRoute = Router;
