import Joi from "joi";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "../utils/validators";

const createNew = async (req, res, next) => {
    const correctCondition = Joi.object({
        boardId: Joi.string()
            .required()
            .pattern(OBJECT_ID_RULE)
            .message(OBJECT_ID_RULE_MESSAGE),
        type: Joi.string()
            .valid('CREATE', 'UPDATE', 'DELETE', 'MOVE')
            .required(),
        userId: Joi.string()
            .required()
            .pattern(OBJECT_ID_RULE)
            .message(OBJECT_ID_RULE_MESSAGE),
        description: Joi.string().required(),
    });

    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false });
        next();
    } catch (error) {
        next(error);
    }
};

const getActivitiesByBoard = async (req, res, next) => {
    const correctCondition = Joi.object({
        boardId: Joi.string()
            .required()
            .pattern(OBJECT_ID_RULE)
            .message(OBJECT_ID_RULE_MESSAGE),
    });

    try {
        await correctCondition.validateAsync(req.params, { abortEarly: false });
        next();
    } catch (error) {
        next(error);
    }
};

const getActivityById = async (req, res, next) => {
    const correctCondition = Joi.object({
        id: Joi.string()
            .required()
            .pattern(OBJECT_ID_RULE)
            .message(OBJECT_ID_RULE_MESSAGE),
    });

    try {
        await correctCondition.validateAsync(req.params, { abortEarly: false });
        next();
    } catch (error) {
        next(error);
    }
};


export const activityValidation = {
    createNew,
    getActivitiesByBoard,
    getActivityById,
    
};

