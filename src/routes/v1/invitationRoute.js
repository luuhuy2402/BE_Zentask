import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { invitationValidation } from "../../validations/invitationValidation";
import { invitationController } from "../../controllers/invitationControllers";

const Router = express.Router();

Router.route("/board").post(
    authMiddleware.isAuthorized,
    invitationValidation.createNewBoardInvitation,
    invitationController.createNewBoardInvitation
);

//Get invitations byUser
Router.route("/")
    .get(authMiddleware.isAuthorized, invitationController.getInvitations)
    .delete(
        authMiddleware.isAuthorized,
        invitationValidation.deleteItem,
        invitationController.deleteItem
    );

//Cập nhật mới bản ghi Board Invitation
Router.route("/board/:invitationId").put(
    authMiddleware.isAuthorized,
    invitationController.updateBoardInvitation
);
export const invitationRoute = Router;
