import Joi from "joi";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "../utils/validators";
import { GET_DB } from "../config/mongodb";
import { ObjectId } from "mongodb";

const ACTIVITY_COLLECTION_NAME = "activities";
const ACTIVITY_COLLECTION_SCHEMA = Joi.object({
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
    createdAt: Joi.date().timestamp("javascript").default(Date.now),
    updatedAt: Joi.date().timestamp("javascript").default(null),
    _destroy: Joi.boolean().default(false),
});

const INVALID_UPDATE_FIELDS = ["_id", "createdAt"];

const validateBeforeCreate = async (data) => {
    return await ACTIVITY_COLLECTION_SCHEMA.validateAsync(data, {
        abortEarly: false,
    });
};

const createNew = async (data) => {
    try {
        const validData = await validateBeforeCreate(data);
        const newActivityToAdd = {
            ...validData,
            boardId: new ObjectId(validData.boardId),
            userId: new ObjectId(validData.userId),
        };
        const createdActivity = await GET_DB()
            .collection(ACTIVITY_COLLECTION_NAME)
            .insertOne(newActivityToAdd);
        return createdActivity;
    } catch (error) {
        throw new Error(error);
    }
};

const findOneById = async (activityId) => {
    try {
        const result = await GET_DB()
            .collection(ACTIVITY_COLLECTION_NAME)
            .findOne({
                _id: new ObjectId(activityId),
            });
        return result;
    } catch (error) {
        throw new Error(error);
    }
};

const getActivitiesByBoard = async (boardId) => {
  try {
    const result = await GET_DB()
        .collection(ACTIVITY_COLLECTION_NAME)
        .aggregate([
            { 
                $match: { 
                    boardId: new ObjectId(boardId)
                } 
            },
            { 
                $sort: { createdAt: -1 } 
            }
        ])
        .toArray();
    return result;
} catch (error) {
    throw new Error(error);
}
};


export const activityModel = {
    ACTIVITY_COLLECTION_NAME,
    ACTIVITY_COLLECTION_SCHEMA,
    createNew,
    findOneById,
    getActivitiesByBoard,
};

