import express from "express";
import { cardController } from "../../controllers/cardController";
import { cardValidation } from "../../validations/cardValidation";

const Router = express.Router();

Router.route("/").post(cardValidation.creatNew, cardController.creatNew);

export const cardRoute = Router;
