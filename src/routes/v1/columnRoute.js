import express from "express";

import { columnController } from "../../controllers/columnController";
import { columnValidation } from "../../validations/columnValidation";
import { authMiddleware } from "../../middlewares/authMiddleware";

const Router = express.Router();

Router.route("/").post(
    authMiddleware.isAuthorized,
    columnValidation.creatNew,
    columnController.creatNew
);
Router.route("/:id")
    .put(
        authMiddleware.isAuthorized,
        columnValidation.update,
        columnController.update
    )
    .delete(
        authMiddleware.isAuthorized,
        columnValidation.deleteItem,
        columnController.deleteItem
    );
export const columnRoute = Router;
