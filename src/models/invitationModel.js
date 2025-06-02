import Joi, { required } from "joi";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "../utils/validators";
import { BOARD_INVITATION_STATUS, INVITATION_TYPES } from "../utils/constants";
import { ObjectId } from "mongodb";
import { GET_DB } from "../config/mongodb";
import { userModel } from "./userModel";
import { boardModel } from "./boardModel";

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
        Object.keys(updateData).forEach((filedName) => {
            if (INVALID_UPDATE_FIELDS.includes(filedName)) {
                delete updateData[filedName];
            }
        });

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

// Query tổng hợp (aggregate) để lấy những bản ghi invitation thuộc 1 user
const findByUser = async (userId) => {
    try {
        const queryConditions = [
            { inviteeId: new ObjectId(userId) }, //tÌm theo inviteeId -  Người được mời - người đang request
            { _destroy: false },
        ];

        const results = await GET_DB()
            .collection(INVITATION_COLLECTION_NAME)
            .aggregate([
                { $match: { $and: queryConditions } },
                {
                    $lookup: {
                        from: userModel.USER_COLLECTION_NAME,
                        localField: "inviterId", //Lấy thông tin người mời
                        foreignField: "_id",
                        as: "inviter",
                        //pipeline trong lookup là để xử lý một hoặc nhiều luồng cần thiết
                        //$project để chỉ định vài field không muốn lấy về bằng cách gán nó giá trị 0
                        pipeline: [
                            { $project: { password: 0, verifyToken: 0 } },
                        ],
                    },
                },
                {
                    $lookup: {
                        from: userModel.USER_COLLECTION_NAME,
                        localField: "inviteeId", //Lấy thông tin người được mời
                        foreignField: "_id",
                        as: "invitee",
                        //pipeline trong lookup là để xử lý một hoặc nhiều luồng cần thiết
                        //$project để chỉ định vài field không muốn lấy về bằng cách gán nó giá trị 0
                        pipeline: [
                            { $project: { password: 0, verifyToken: 0 } },
                        ],
                    },
                },
                {
                    $lookup: {
                        from: boardModel.BOARD_COLLECTION_NAME,
                        localField: "boardInvitation.boardId", //Thông tin board
                        foreignField: "_id",
                        as: "board",
                    },
                },
            ])
            .toArray();

        // console.log(results);

        return results;
    } catch (error) {
        throw new Error(error);
    }
};
const deleteOneById = async (invitationId) => {
    try {
        const result = await GET_DB()
            .collection(INVITATION_COLLECTION_NAME)
            .deleteOne({
                _id: new ObjectId(invitationId),
            });
        // console.log("🚀 ~ deleteOneById ~ result:", result);

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
    findByUser,
    deleteOneById,
};
