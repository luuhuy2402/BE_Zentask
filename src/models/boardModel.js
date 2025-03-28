import Joi from "joi";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "../utils/validators";
import { GET_DB } from "../config/mongodb";
import { ObjectId } from "mongodb";
import { BOARD_TYPES } from "../utils/constants";
import { columnModel } from "./columnModel";
import { cardModel } from "./cardModel";

//Define Collection (Name & Schema)
const BOARD_COLLECTION_NAME = "boards";
const BOARD_COLLECTION_SCHEMA = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict(),
    slug: Joi.string().required().min(3).trim().strict(),
    description: Joi.string().required().min(3).max(256).trim().strict(),
    type: Joi.string()
        .valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE)
        .required(),

    columnOrderIds: Joi.array()
        .items(
            Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
        )
        .default([]),

    createdAt: Joi.date().timestamp("javascript").default(Date.now),
    updatedAt: Joi.date().timestamp("javascript").default(null),
    _destroy: Joi.boolean().default(false),
});
//Chỉ đinh các field không cho phép update trong hàm update
const INVALID_UPDATE_FIELDS = ["_id", "createdAt"];

const validateBeforeCreate = async (data) => {
    return await BOARD_COLLECTION_SCHEMA.validateAsync(data, {
        abortEarly: false,
    });
};

const createNew = async (data) => {
    try {
        const validData = await validateBeforeCreate(data);
        const createdBoard = await GET_DB()
            .collection(BOARD_COLLECTION_NAME)
            .insertOne(validData);
        return createdBoard;
    } catch (error) {
        throw new Error(error);
    }
};

const findOneById = async (id) => {
    try {
        const result = await GET_DB()
            .collection(BOARD_COLLECTION_NAME)
            .findOne({
                _id: new ObjectId(id),
            });
        return result;
    } catch (error) {
        throw new Error(error);
    }
};

// Query tổng hợp (aggregate) để lấy toàn bộ Columns và Cards thuộc về Board
const getDetails = async (id) => {
    try {
        // const result = await GET_DB()
        //     .collection(BOARD_COLLECTION_NAME)
        //     .findOne({
        //         _id: new ObjectId(id),
        //     });

        const result = await GET_DB()
            .collection(BOARD_COLLECTION_NAME)
            .aggregate([
                { $match: { _id: new ObjectId(id), _destroy: false } },
                {
                    $lookup: {
                        from: columnModel.COLUMN_COLLECTION_NAME,
                        localField: "_id", //đây là id của board
                        foreignField: "boardId", //đây là id của board ở column( column thuộc board nào)
                        as: "columns", //as để định nghĩa tên thuộc tính trên db
                    },
                },
                {
                    $lookup: {
                        from: cardModel.CARD_COLLECTION_NAME,
                        localField: "_id", //đây là id của board
                        foreignField: "boardId", //đây là id của board ở card( card thuộc board nào)
                        as: "cards",
                    },
                },
            ])
            .toArray();
        console.log(result);
        return result[0] || null;
    } catch (error) {
        throw new Error(error);
    }
};

//nhiệm vụ là push columnId vào cuối mảng columnOrderIds
const pushColumnOrderIds = async (column) => {
    try {
        const result = await GET_DB()
            .collection(BOARD_COLLECTION_NAME)
            .findOneAndUpdate(
                { _id: new ObjectId(column.boardId) },
                { $push: { columnOrderIds: new ObjectId(column._id) } },
                { returnDocument: "after" }
            );
        return result;
    } catch (error) {
        throw new Error(error);
    }
};

const update = async (boardId, updateData) => {
    try {
        //Loại bỏ các field không cho phép update
        Object.keys(updateData).forEach((filedName) => {
            if (INVALID_UPDATE_FIELDS.includes(filedName)) {
                delete updateData[filedName];
            }
        });

        //Đối với những dữ liệu liên quan đến ObjectID
        if (updateData.columnOrderIds) {
            updateData.columnOrderIds = updateData.columnOrderIds.map(
                (_id) => new ObjectId(_id)
            );
        }
        const result = await GET_DB()
            .collection(BOARD_COLLECTION_NAME)
            .findOneAndUpdate(
                { _id: new ObjectId(boardId) },
                { $set: updateData },
                { returnDocument: "after" }
            );
        return result;
    } catch (error) {
        throw new Error(error);
    }
};

export const boardModel = {
    BOARD_COLLECTION_NAME,
    BOARD_COLLECTION_SCHEMA,
    createNew,
    findOneById,
    getDetails,
    pushColumnOrderIds,
    update,
};
