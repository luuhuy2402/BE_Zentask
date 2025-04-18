import { StatusCodes } from "http-status-codes";
import { boardModel } from "../models/boardModel";
import ApiError from "../utils/ApiError";
import { slugify } from "../utils/formatters";
import { cloneDeep } from "lodash";
import { columnModel } from "../models/columnModel";
import { cardModel } from "../models/cardModel";
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from "../utils/constants";

// xử lý logic : controller là xử lý điều hướng xong chuyển sang service
const createNew = async (userId, reqbody) => {
    try {
        // Xử lý logic dữ liệu tùy đặc thù dự án
        const newBoard = {
            ...reqbody,
            slug: slugify(reqbody.title),
        };

        // Gọi tới tầng Model để xử lý lưu bản ghi newBoard vào trong Database
        const createdBoard = await boardModel.createNew(userId, newBoard);

        //Lấy bản ghi board sau khi gọi ( tùy mục đích dự án mà có cần bước này ko)
        const getNewBoard = await boardModel.findOneById(
            createdBoard.insertedId
        );
        console.log(getNewBoard);

        // Làm thêm các xử lý logic khác với các collection khác tùy đặc thù dự án
        // Bắn email, notification về cho admin khi có 1 cái board được tạo,...

        // Trả kết quả về, trong Service luôn phải có return
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
        // clone Deep board ra một cái mới để xử lý, ko ảnh hưởng tới board ban đầu
        const resBoard = cloneDeep(board);
        // Đưa card về đúng column của nó
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

const update = async (boardId, reqBody) => {
    try {
        //cần truyền thên updatedAt để cập nhật thời gian cập nhật
        const updateData = { ...reqBody, updateAt: Date.now() };

        const updatedBoard = await boardModel.update(boardId, updateData);

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

const getBoards = async (userId, page, itemsPerPage) => {
    try {
        //nếu không tồn tại page. itemsPerPage gửi len thì gán gtri mặc định
        if (!page) page = DEFAULT_PAGE;
        if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE;
        const results = await boardModel.getBoards(
            userId,
            parseInt(page, 10),
            parseInt(itemsPerPage, 10)
        );
        return results;
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
};
