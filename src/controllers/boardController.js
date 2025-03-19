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

export const boardController = { creatNew };
