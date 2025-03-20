// xử lý các điều hướng
import { StatusCodes } from "http-status-codes";
import { boardService } from "../services/boardService";

const creatNew = async (req, res, next) => {
    try {
        //Điều hướng dữ liệu sang tầng Service
        const createdBoard = await boardService.createNew(req.body);

        //Có kết quả thì trả về phía client
        res.status(StatusCodes.CREATED).json(createdBoard);
    } catch (error) {
        next(error); //sẽ nhảy sang file server vào phần xử lý lỗi tập trung
    }
};

const getDetails = async (req, res, next) => {
    try {
        const boardId = req.params.id;
        //sẽ có thêm userId để chỉ lấy board thuộc về user đó,...
        const board = await boardService.getDetails(boardId);
        res.status(StatusCodes.OK).json(board);
    } catch (error) {
        next(error); //sẽ nhảy sang file server vào phần xử lý lỗi tập trung
    }
};
export const boardController = { creatNew, getDetails };
