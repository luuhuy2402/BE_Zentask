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
        next(error); //sẽ nhảy sang file server vào phần xử lý lỗi tập trung
    }
};

export const boardController = { creatNew };
