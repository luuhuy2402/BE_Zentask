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
        return result[0] || {};
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
};

// 67dcbf2b405b5a4a4396b15a
// 67dcc4fe0dd2b1d74399ebfd
