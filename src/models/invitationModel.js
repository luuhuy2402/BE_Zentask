import Joi, { required } from "joi";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "../utils/validators";
import { BOARD_INVITATION_STATUS, INVITATION_TYPES } from "../utils/constants";
import { ObjectId } from "mongodb";
import { GET_DB } from "../config/mongodb";

// Define Collection (name & schema)
const INVITATION_COLLECTION_NAME = "invitations";
const INVITATION_COLLECTION_SCHEMA = Joi.object({
    inviterId: Joi.string()
        .required()
        .pattern(OBJECT_ID_RULE)
        .message(OBJECT_ID_RULE_MESSAGE),
    inviteeId: Joi.string()
        .required()
        .pattern(OBJECT_ID_RULE)
        .message(OBJECT_ID_RULE_MESSAGE),
    type: Joi.string()
        .required()
        .valid(...Object.values(INVITATION_TYPES)),

    //Lời mời là board thì sẽ lưu thêm dữ liệu boardInvitation - optional
    boardInvitation: Joi.object({
        boardId: Joi.string()
            .required()
            .pattern(OBJECT_ID_RULE)
            .message(OBJECT_ID_RULE_MESSAGE),
        status: Joi.string()
            .required()
            .valid(...Object.values(BOARD_INVITATION_STATUS)),
    }).optional(),

    createdAt: Joi.date().timestamp("javascript").default(Date.now),
    updatedAt: Joi.date().timestamp("javascript").default(null),
    _destroy: Joi.boolean().default(false),
});

//Chỉ đinh các field không cho phép update trong hàm update
const INVALID_UPDATE_FIELDS = [
    "_id",
    "inviterId",
    "inviteeId",
    "type",
    "createdAt",
];

const validateBeforeCreate = async (data) => {
    return await INVITATION_COLLECTION_SCHEMA.validateAsync(data, {
        abortEarly: false,
    });
};

const createNewBoardInvitation = async (data) => {
    try {
        const validData = await validateBeforeCreate(data);
        const newInvitationToAdd = {
            ...validData,
            inviterId: new ObjectId(validData.inviterId),
            inviteeId: new ObjectId(validData.inviteeId),
        };
        //Nếu tồn tại dữ liệu boardInvitation thì update cho cái boardId
        if (validData.boardInvitation) {
            newInvitationToAdd.boardInvitation = {
                ...validData.boardInvitation,
                boardId: new ObjectId(validData.boardInvitation.boardId),
            };
        }
        //gọi insert vào DB
        const createdInvitation = await GET_DB()
            .collection(INVITATION_COLLECTION_NAME)
            .insertOne(newInvitationToAdd);
        return createdInvitation;
    } catch (error) {
        throw new Error(error);
    }
};

const findOneById = async (invitationId) => {
    try {
        const result = await GET_DB()
            .collection(INVITATION_COLLECTION_NAME)
            .findOne({
                _id: new ObjectId(invitationId),
            });
        return result;
    } catch (error) {
        throw new Error(error);
    }
};

const update = async (invitationId, updateData) => {
    try {
        //Loại bỏ các field không cho phép update
        Object.keys(updateData).forEach((filedName) => {
            if (INVALID_UPDATE_FIELDS.includes(filedName)) {
                delete updateData[filedName];
            }
        });

        //Đối với những dữ liệu liên quan đến ObjectID
        if (updateData.boardInvitation) {
            updateData.boardInvitation = {
                ...updateData.boardInvitation,
                boardId: new ObjectId(updateData.boardInvitation.boardId),
            };
        }
        const result = await GET_DB()
            .collection(INVITATION_COLLECTION_NAME)
            .findOneAndUpdate(
                { _id: new ObjectId(invitationId) },
                { $set: updateData },
                { returnDocument: "after" }
            );
        return result;
    } catch (error) {
        throw new Error(error);
    }
};

export const invitationModel = {
    INVITATION_COLLECTION_NAME,
    INVITATION_COLLECTION_SCHEMA,
    createNewBoardInvitation,
    findOneById,
    update,
};
