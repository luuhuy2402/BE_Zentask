import Joi from "joi";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "../utils/validators";
import { GET_DB } from "../config/mongodb";
import { ObjectId } from "mongodb";
import { BOARD_TYPES } from "../utils/constants";
import { columnModel } from "./columnModel";
import { cardModel } from "./cardModel";
import { pagingSkipValue } from "../utils/algorithms";
import { userModel } from "./userModel";

const BOARD_COLLECTION_NAME = "boards";
const BOARD_COLLECTION_SCHEMA = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict(),
    slug: Joi.string().required().min(3).trim().strict(),
    description: Joi.string().required().min(3).max(256).trim().strict(),
    boardCover: Joi.string().default(null),
    type: Joi.string()
        .valid(...Object.values(BOARD_TYPES))
        .required(),

    columnOrderIds: Joi.array()
        .items(
            Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
        )
        .default([]),
    ownerIds: Joi.array()
        .items(
            Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
        )
        .default([]),
    memberIds: Joi.array()
        .items(
            Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
        )
        .default([]),
    createdAt: Joi.date().timestamp("javascript").default(Date.now),
    updatedAt: Joi.date().timestamp("javascript").default(null),
    _destroy: Joi.boolean().default(false),
});

const INVALID_UPDATE_FIELDS = ["_id", "createdAt"];

const validateBeforeCreate = async (data) => {
    return await BOARD_COLLECTION_SCHEMA.validateAsync(data, {
        abortEarly: false,
    });
};

const createNew = async (userId, data) => {
    try {
        const validData = await validateBeforeCreate(data);

        const newBoardToAdd = {
            ...validData,
            ownerIds: [new ObjectId(userId)],
        };
        const createdBoard = await GET_DB()
            .collection(BOARD_COLLECTION_NAME)
            .insertOne(newBoardToAdd);
        return createdBoard;
    } catch (error) {
        throw new Error(error);
    }
};

const findOneById = async (boardId) => {
    try {
        const result = await GET_DB()
            .collection(BOARD_COLLECTION_NAME)
            .findOne({
                _id: new ObjectId(boardId),
            });
        return result;
    } catch (error) {
        throw new Error(error);
    }
};

const deleteOneById = async (boardId) => {
    try {
        const result = await GET_DB()
            .collection(BOARD_COLLECTION_NAME)
            .deleteOne({
                _id: new ObjectId(boardId),
            });
        // console.log("🚀 ~ deleteOneById ~ result:", result);

        return result;
    } catch (error) {
        throw new Error(error);
    }
};
// Query tổng hợp (aggregate) để lấy toàn bộ Columns và Cards thuộc về Board
const getDetails = async (userId, boardId) => {
    try {
        const queryConditions = [
            { _id: new ObjectId(boardId) },
            { _destroy: false },
            {
                $or: [
                    { ownerIds: { $all: [new ObjectId(userId)] } },
                    { memberIds: { $all: [new ObjectId(userId)] } },
                ],
            },
        ];

        const result = await GET_DB()
            .collection(BOARD_COLLECTION_NAME)
            .aggregate([
                { $match: { $and: queryConditions } },
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
                {
                    $lookup: {
                        from: userModel.USER_COLLECTION_NAME,
                        localField: "ownerIds", //đây là owerIds của board
                        foreignField: "_id", //đây là id user owr usermodel
                        as: "owners", //trả về mảng có tên owners
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
                        localField: "memberIds",
                        foreignField: "_id",
                        as: "members",
                        //pipeline trong lookup là để xử lý một hoặc nhiều luồng cần thiết
                        //$project để chỉ định vài field không muốn lấy về bằng cách gán nó giá trị 0
                        pipeline: [
                            { $project: { password: 0, verifyToken: 0 } },
                        ],
                    },
                },
            ])
            .toArray();
        // console.log(result);
        return result[0] || null;
    } catch (error) {
        throw new Error(error);
    }
};
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

const pullColumnOrderIds = async (column) => {
    try {
        const result = await GET_DB()
            .collection(BOARD_COLLECTION_NAME)
            .findOneAndUpdate(
                { _id: new ObjectId(column.boardId) },
                { $pull: { columnOrderIds: new ObjectId(column._id) } },
                { returnDocument: "after" }
            );
        return result;
    } catch (error) {
        throw new Error(error);
    }
};

const update = async (boardId, updateData) => {
    try {
        Object.keys(updateData).forEach((filedName) => {
            if (INVALID_UPDATE_FIELDS.includes(filedName)) {
                delete updateData[filedName];
            }
        });

        if (updateData.columnOrderIds) {
            updateData.columnOrderIds = updateData.columnOrderIds.map(
                (_id) => new ObjectId(_id)
            );
        }

        // Convert boardId to ObjectId
        const objectId = new ObjectId(boardId);
        
        const result = await GET_DB()
            .collection(BOARD_COLLECTION_NAME)
            .findOneAndUpdate(
                { _id: objectId },
                { $set: updateData },
                { returnDocument: "after" }
            );
        return result;
    } catch (error) {
        throw new Error(error);
    }
};

const getBoards = async (userId, page, itemsPerPage, queryFilters) => {
    try {
        const queryConditions = [
            //ĐK 1: board chưa bị xóa
            { _destroy: false },
            //Đk 2: userId đang thực hiện request phải thuộc một trong 2 mảng ownerIds hoặc memberIds, sử dụng toán từ $all vủa mongodb
            {
                $or: [
                    { ownerIds: { $all: [new ObjectId(userId)] } },
                    { memberIds: { $all: [new ObjectId(userId)] } },
                ],
            },
        ];

        //Xử lý query filter cho từng trường hợp search board: theo title,...
        if (queryFilters) {
            Object.keys(queryFilters).forEach((key) => {
                //Phân biệt chữ hoa thường
                // queryConditions.push({
                //     [key]: { $regex: queryFilters[key] },
                // });
                //Không phân biệt chữa hoa thường
                queryConditions.push({
                    [key]: { $regex: new RegExp(queryFilters[key], "i") },
                });
            });
        }

        const query = await GET_DB()
            .collection(BOARD_COLLECTION_NAME)
            .aggregate(
                [
                    { $match: { $and: queryConditions } },
                    //sort title của board theo A-Z
                    { $sort: { title: 1 } },
                    //$facet: xử lý nhiều luồng trong 1 query
                    {
                        $facet: {
                            //Luồng 1: query boards
                            queryBoards: [
                                //Bỏ qua số lượng bản ghi của những page trước đó
                                { $skip: pagingSkipValue(page, itemsPerPage) },
                                //Gioi hạn số lượng bản ghi trên 1 trang là 12
                                { $limit: itemsPerPage },
                            ],
                            //Luồng 2: query đến tổng tất cả số lượng bản ghi boards trong DB và trả về vào biến countedAllBoards
                            queryTotalBoards: [{ $count: "countedAllBoards" }],
                        },
                    },
                ],
                //Khai báo thêm thuộc tính collation locale 'en' để fix chữ B hoa và sắp xếp trước a. bảng mã ASII
                { collation: { locale: "en" } }
            )
            .toArray();
        // console.log(" query", query);

        const res = query[0];
        return {
            boards: res.queryBoards || [],
            totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0,
        };
    } catch (error) {
        throw new Error(error);
    }
};

const pushMemberIds = async (boardId, userId) => {
    try {
        const result = await GET_DB()
            .collection(BOARD_COLLECTION_NAME)
            .findOneAndUpdate(
                { _id: new ObjectId(boardId) },
                { $push: { memberIds: new ObjectId(userId) } },
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
    pullColumnOrderIds,
    getBoards,
    pushMemberIds,
    deleteOneById,
};
