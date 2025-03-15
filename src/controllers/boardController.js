// xử lý các điều hướng
import { StatusCodes } from "http-status-codes";

const creatNew = async (req, res, next) => {
    try {
        console.log(req.body);
        //Điều hướng dữ liệu sang tầng Service

        //Có kết quả thì trả về phía client
        res.status(StatusCodes.CREATED).json({
            message: "Post form Controller: API create new board",
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            errors: error.message,
        });
    }
};

export const boardController = { creatNew };
