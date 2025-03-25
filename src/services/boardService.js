import { StatusCodes } from "http-status-codes";
import { boardModel } from "../models/boardModel";
import ApiError from "../utils/ApiError";
import { slugify } from "../utils/formatters";
import { cloneDeep } from "lodash";

// xử lý logic : controller là xử lý điều hướng xong chuyển sang service
const createNew = async (reqbody) => {
    try {
        // Xử lý logic dữ liệu tùy đặc thù dự án
        const newBoard = {
            ...reqbody,
            slug: slugify(reqbody.title),
        };

        // Gọi tới tầng Model để xử lý lưu bản ghi newBoard vào trong Database
        const createdBoard = await boardModel.createNew(newBoard);

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

const getDetails = async (boardId) => {
    try {
        const board = await boardModel.getDetails(boardId);
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
export const boardService = {
    createNew,
    getDetails,
    update,
};
