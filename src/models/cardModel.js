import Joi from "joi";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "~/utils/validators";
import { GET_DB } from "../config/mongodb";
import { ObjectId } from "mongodb";
import { EMAIL_RULE, EMAIL_RULE_MESSAGE } from "../utils/validators";
import commandConvert from "cross-env/src/command";
import { CARD_MEMBER_ACTIONS } from "../utils/constants";

// Define Collection (name & schema)
const CARD_COLLECTION_NAME = "cards";
const CARD_COLLECTION_SCHEMA = Joi.object({
    boardId: Joi.string()
        .required()
        .pattern(OBJECT_ID_RULE)
        .message(OBJECT_ID_RULE_MESSAGE),
    columnId: Joi.string()
        .required()
        .pattern(OBJECT_ID_RULE)
        .message(OBJECT_ID_RULE_MESSAGE),

    title: Joi.string().required().min(3).max(50).trim().strict(),
    description: Joi.string().optional(),

    cover: Joi.string().default(null),
    attachment: Joi.array().items(Joi.string()).default([]),
    memberIds: Joi.array()
        .items(
            Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
        )
        .default([]),
    comments: Joi.array()
        .items({
            _id: Joi.string().required(),
            userId: Joi.string()
                .required()
                .pattern(OBJECT_ID_RULE)
                .message(OBJECT_ID_RULE_MESSAGE),
            userEmail: Joi.string()
                .required()
                .pattern(EMAIL_RULE)
                .message(EMAIL_RULE_MESSAGE),
            userAvatar: Joi.string(),
            userDisplayName: Joi.string(),
            content: Joi.string(),
            commentedAt: Joi.date().timestamp(),
        })
        .default([]),

    createdAt: Joi.date().timestamp("javascript").default(Date.now),
    updatedAt: Joi.date().timestamp("javascript").default(null),
    _destroy: Joi.boolean().default(false),
});

const INVALID_UPDATE_FIELDS = ["_id", "boardId", "createdAt"];

const validateBeforeCreate = async (data) => {
    return await CARD_COLLECTION_SCHEMA.validateAsync(data, {
        abortEarly: false,
    });
};

const createNew = async (data) => {
    try {
        const validData = await validateBeforeCreate(data);
        const newCardToAdd = {
            ...validData,
            boardId: new ObjectId(validData.boardId),
            columnId: new ObjectId(validData.columnId),
        };

        const createdCard = await GET_DB()
            .collection(CARD_COLLECTION_NAME)
            .insertOne(newCardToAdd);
        return createdCard;
    } catch (error) {
        throw new Error(error);
    }
};

const findOneById = async (cardId) => {
    try {
        const result = await GET_DB()
            .collection(CARD_COLLECTION_NAME)
            .findOne({
                _id: new ObjectId(cardId),
            });
        return result;
    } catch (error) {
        throw new Error(error);
    }
};

const findOneByUserId = async (userId) => {
    try {
        const result = await GET_DB()
            .collection(CARD_COLLECTION_NAME)
            .find({
                memberIds: new ObjectId(userId),
            })
            .toArray();
        return result;
    } catch (error) {
        throw new Error(error);
    }
};
const update = async (cardId, updateData) => {
    try {
        Object.keys(updateData).forEach((filedName) => {
            if (INVALID_UPDATE_FIELDS.includes(filedName)) {
                delete updateData[filedName];
            }
        });

        if (updateData.columnId) {
            updateData.columnId = new ObjectId(updateData.columnId);
        }
        const result = await GET_DB()
            .collection(CARD_COLLECTION_NAME)
            .findOneAndUpdate(
                { _id: new ObjectId(cardId) },
                { $set: updateData },
                { returnDocument: "after" }
            );
        return result;
    } catch (error) {
        throw new Error(error);
    }
};

const deleteManyByColumnId = async (columnId) => {
    try {
        const result = await GET_DB()
            .collection(CARD_COLLECTION_NAME)
            .deleteMany({
                columnId: new ObjectId(columnId),
            });
        // console.log("🚀 ~ deleteManyByColumnId ~ result:", result);

        return result;
    } catch (error) {
        throw new Error(error);
    }
};

const deleteManyByBoardId = async (boardId) => {
    try {
        const result = await GET_DB()
            .collection(CARD_COLLECTION_NAME)
            .deleteMany({
                boardId: new ObjectId(boardId),
            });
        // console.log("🚀 ~ deleteManyByColumnId ~ result:", result);

        return result;
    } catch (error) {
        throw new Error(error);
    }
};
const unshiftNewComment = async (cardId, commentData) => {
    try {
        const commentWithId = {
            ...commentData,
            _id: new ObjectId().toString()
        };
        const result = await GET_DB()
            .collection(CARD_COLLECTION_NAME)
            .findOneAndUpdate(
                { _id: new ObjectId(cardId) },
                { $push: { comments: { $each: [commentWithId], $position: 0 } } },
                { returnDocument: "after" }
            );
        return result;
    } catch (error) {
        throw new Error(error);
    }
};

const updateComment = async (cardId, commentId, newContent, userId) => {
    try {
        const result = await GET_DB()
            .collection(CARD_COLLECTION_NAME)
            .findOneAndUpdate(
                { 
                    _id: new ObjectId(cardId),
                    "comments._id": commentId,
                    "comments.userId": userId
                },
                { 
                    $set: { 
                        "comments.$[elem].content": newContent,
                        "comments.$[elem].commentedAt": Date.now()
                    }
                },
                { 
                    arrayFilters: [{ 
                        "elem._id": commentId,
                        "elem.userId": userId 
                    }],
                    returnDocument: "after"
                }
            );
        return result;
    } catch (error) {
        throw new Error(error);
    }
};

const deleteComment = async (cardId, commentId, userId) => {
    try {
        const result = await GET_DB()
            .collection(CARD_COLLECTION_NAME)
            .findOneAndUpdate(
                { _id: new ObjectId(cardId) },
                { 
                    $pull: { 
                        comments: { 
                            _id: commentId,
                            userId: userId
                        }
                    }
                },
                { returnDocument: "after" }
            );
        return result;
    } catch (error) {
        throw new Error(error);
    }
};

//Thêm hoặc xóa member khỏi card theo action
const updateMembers = async (cardId, incomingMemberInfo) => {
    try {
        let updateCondition = {};
        if (incomingMemberInfo.action === CARD_MEMBER_ACTIONS.ADD) {
            // console.log("Add incomingMemberInfo", incomingMemberInfo);
            updateCondition = {
                $push: { memberIds: new ObjectId(incomingMemberInfo.userId) },
            };
        }
        if (incomingMemberInfo.action === CARD_MEMBER_ACTIONS.REMOVE) {
            // console.log("Remove incomingMemberInfo", incomingMemberInfo);
            updateCondition = {
                $pull: { memberIds: new ObjectId(incomingMemberInfo.userId) },
            };
        }
        const result = await GET_DB()
            .collection(CARD_COLLECTION_NAME)
            .findOneAndUpdate(
                {
                    _id: new ObjectId(cardId),
                },
                updateCondition,
                { returnDocument: "after" }
            );
        return result;
    } catch (error) {
        throw new Error(error);
    }
};

const deleteOneById = async (cardId) => {
    try {
        const result = await GET_DB()
            .collection(CARD_COLLECTION_NAME)
            .deleteOne({
                _id: new ObjectId(cardId),
            });
        // console.log("🚀 ~ deleteOneById ~ result:", result);

        return result;
    } catch (error) {
        throw new Error(error);
    }
};

const unshiftAttachment = async (cardId, attachmentFile) => {
    try {
        const result = await GET_DB()
            .collection(CARD_COLLECTION_NAME)
            .findOneAndUpdate(
                { _id: new ObjectId(cardId) },
                {
                    $push: {
                        attachment: { $each: [attachmentFile], $position: 0 },
                    },
                },
                { returnDocument: "after" }
            );
        return result;
    } catch (error) {
        throw new Error(error);
    }
};

export const cardModel = {
    CARD_COLLECTION_NAME,
    CARD_COLLECTION_SCHEMA,
    createNew,
    findOneById,
    update,
    deleteManyByColumnId,
    unshiftNewComment,
    updateComment,
    deleteComment,
    updateMembers,
    deleteOneById,
    unshiftAttachment,
    findOneByUserId,
    deleteManyByBoardId,
};
