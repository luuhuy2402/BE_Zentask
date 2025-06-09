import { StatusCodes } from "http-status-codes";
import { boardModel } from "../models/boardModel";
import ApiError from "../utils/ApiError";
import { slugify } from "../utils/formatters";
import { cloneDeep } from "lodash";
import { columnModel } from "../models/columnModel";
import { cardModel } from "../models/cardModel";
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from "../utils/constants";
import { CloudinaryProvider } from "../providers/CloudinaryProvider";

const createNew = async (userId, reqbody) => {
    try {
        const newBoard = {
            ...reqbody,
            slug: slugify(reqbody.title),
        };

        const createdBoard = await boardModel.createNew(userId, newBoard);

        const getNewBoard = await boardModel.findOneById(
            createdBoard.insertedId
        );
        // console.log(getNewBoard);

        return getNewBoard;
    } catch (error) {
        throw error;
    }
};

const getDetails = async (userId, boardId) => {
    try {
        const board = await boardModel.getDetails(userId, boardId);
        if (!board) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Board not found!");
        }
        const resBoard = cloneDeep(board);

        resBoard.columns.forEach((column) => {
            // C1: dunfg .equals vif MongoDB cos support .equals dể so sánh ObjectId
            // column.cards = resBoard.cards.filter((card) =>
            //     card.columnId.equals(column._id)
            // );
            // C2: Conver ObjectID về string của JS => so sánh
            column.cards = resBoard.cards.filter(
                (card) => card.columnId.toString() === column._id.toString()
            );
        });
        //Xóa mảng card khỏi board ban đầu
        delete resBoard.cards;

        return resBoard;
    } catch (error) {
        throw error;
    }
};

const update = async (boardId, reqBody, boardCoverFile) => {
    try {
        const updateData = { ...reqBody, updatedAt: Date.now() };
        let updatedBoard = {};

        if (boardCoverFile) {
            //Trường hợp upload file lên Cloud Storage: Cloudinary
            const uploadResult = await CloudinaryProvider.streamUpload(
                boardCoverFile.buffer,
                "board-cover"
            );

            //Lưu lại url của file ảnh vào DB
            updatedBoard = await boardModel.update(boardId, {
                boardCover: uploadResult.secure_url,
                updatedAt: Date.now()
            });
        } else {
            updatedBoard = await boardModel.update(boardId, updateData);
        }

        return updatedBoard;
    } catch (error) {
        throw error;
    }
};

const moveCardToDifferentColumn = async (reqBody) => {
    try {
        /**Khi di chuyển card sang Column khác
         * B1: Cập nhật mảng cardOrderIds cùa Column ban đầu chứa nó
         * B2: Cập nhật mảng cardOrderIds của Column tiếp theo
         * B3: Cập nhập lại trường columnId mới của Card đã kéo
         */
        //B1
        await columnModel.update(reqBody.prevColumnId, {
            cardOrderIds: reqBody.prevCardOrderIds,
            updatedAt: Date.now(),
        });
        //B2
        await columnModel.update(reqBody.nextColumnId, {
            cardOrderIds: reqBody.nextCardOrderIds,
            updatedAt: Date.now(),
        });
        //B3
        await cardModel.update(reqBody.currentCardId, {
            columnId: reqBody.nextColumnId,
        });

        return { updateResult: "Successfully" };
    } catch (error) {
        throw error;
    }
};

const getBoards = async (userId, page, itemsPerPage, queryFilters) => {
    try {
        //nếu không tồn tại page. itemsPerPage gửi len thì gán gtri mặc định
        if (!page) page = DEFAULT_PAGE;
        if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE;
        const results = await boardModel.getBoards(
            userId,
            parseInt(page, 10),
            parseInt(itemsPerPage, 10),
            queryFilters
        );
        return results;
    } catch (error) {
        throw error;
    }
};

const deleteItem = async (boardId) => {
    try {

        await boardModel.deleteOneById(boardId);
        await cardModel.deleteManyByBoardId(boardId);
        await columnModel.deleteManyByBoardId(boardId);

        // //Xóa columnId trong mảng columnOrderIds của Board chứa column xóa
        // await boardModel.pullColumnOrderIds(targetColumn);

        return { deleteResult: "Column and its Cards deleted successfully" };
    } catch (error) {
        throw error;
    }
};
export const boardService = {
    createNew,
    getDetails,
    update,
    moveCardToDifferentColumn,
    getBoards,
    deleteItem,
};
