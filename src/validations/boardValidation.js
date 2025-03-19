import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import ApiError from "../utils/ApiError";

// validate dữ liệu từ FE gửi lên
const creatNew = async (req, res, next) => {
    /**
     * Mặc định chúng ta ko cần phải custom message ở phía BE làm gì vì để cho frontend tự validate và custom message phía FE cho đẹp
     * Back end chỉ vần validate đảm bảo dữ liệu chuẩn xác và trả về message mặc định từ thư viện là được
     * Quan trọng: Việc validate dữ liệu bắt buộc phải có ở phía BE vì đây là điểm cuối để lưu trữ dữ liệu vào database
     * Và thông thường trong thực tế điều tốt nhất cho hệ thống là hãy luôn validate dữ liệu ở cả BE và FE
     */
    const correctCondition = Joi.object({
        title: Joi.string().required().min(3).max(50).trim().strict().message({
            "any.required": "Title is required",
            "string.empty": "Title is not allowed to be empty",
            "string.min": "Title length must be at least 3 characters long",
            "string.max": "Title max 50 chars",
            "string.trim": "Title must not have leading or trailing whitespace",
        }),
        description: Joi.string().required().min(3).max(256).trim().strict(),
    });
    try {
        //SET abortEarly flase để có nhiều lỗi validation thì trả về tất cả lỗi
        await correctCondition.validateAsync(req.body, { abortEarly: false });
        //validate dữ liệu hợp lệ thì cho request đi tiếp sang controller
        next();
    } catch (error) {
        const errorMessage = new Error(error).message;
        const customError = new ApiError(
            StatusCodes.UNPROCESSABLE_ENTITY,
            errorMessage
        );
        next(customError); //sẽ nhảy sang file server vào phần xử lý lỗi tập trung
    }
};

export const boardValidation = { creatNew };
