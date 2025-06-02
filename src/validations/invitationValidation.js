import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError";
import Joi from "joi";

const createNewBoardInvitation = async (req, res, next) => {
    const correctCondition = Joi.object({
        inviteeEmail: Joi.string().required(),
        boardId: Joi.string().required(),
    });
    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false });

        next();
    } catch (error) {
        const errorMessage = new Error(error).message;
        const customError = new ApiError(
            StatusCodes.UNPROCESSABLE_ENTITY,
            errorMessage
        );
        next(customError);
    }
};
const deleteItem = async (req, res, next) => {
    const correctCondition = Joi.object({
        id: Joi.string()
            .required()
            .pattern(OBJECT_ID_RULE)
            .message(OBJECT_ID_RULE_MESSAGE),
    });
    try {
        await correctCondition.validateAsync(req.body);

        next();
    } catch (error) {
        const errorMessage = new Error(error).message;
        const customError = new ApiError(
            StatusCodes.UNPROCESSABLE_ENTITY,
            errorMessage
        );
        next(customError);
    }
};
export const invitationValidation = { createNewBoardInvitation, deleteItem };
