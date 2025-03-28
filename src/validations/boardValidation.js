import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import ApiError from "../utils/ApiError";
import { BOARD_TYPES } from "../utils/constants";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "../utils/validators";

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
        type: Joi.string()
            .valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE)
            .required(),
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

const update = async (req, res, next) => {
    //Chú ý ko dùng require khi update
    const correctCondition = Joi.object({
        title: Joi.string().min(3).max(50).trim().strict().message({}),
        description: Joi.string().min(3).max(256).trim().strict(),
        type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE),
        // thêm field columnOrderIds vào cũng được( thêm chắc chắn)
        // columnOrderIds: Joi.array()
        //     .items(
        //         Joi.string()
        //             .pattern(OBJECT_ID_RULE)
        //             .message(OBJECT_ID_RULE_MESSAGE)
        //     )
        //     .default([]),
    });
    try {
        //SET abortEarly flase để có nhiều lỗi validation thì trả về tất cả lỗi
        await correctCondition.validateAsync(req.body, {
            abortEarly: false,
            //Khi update thì cho phép Unknown để cho phép update các field khác mà chưa được định nghĩa trong trường hợp này
            //mk đang đẩy lên field columnOrderIds
            allowUnknown: true,
        });
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

const moveCardToDifferentColumn = async (req, res, next) => {
    const correctCondition = Joi.object({
        currentCardId: Joi.string()
            .required()
            .pattern(OBJECT_ID_RULE)
            .message(OBJECT_ID_RULE_MESSAGE),
        prevColumnId: Joi.string()
            .required()
            .pattern(OBJECT_ID_RULE)
            .message(OBJECT_ID_RULE_MESSAGE),
        prevCardOrderIds: Joi.array()
            .required()
            .items(
                Joi.string()
                    .pattern(OBJECT_ID_RULE)
                    .message(OBJECT_ID_RULE_MESSAGE)
            ),
        nextColumnId: Joi.string()
            .required()
            .pattern(OBJECT_ID_RULE)
            .message(OBJECT_ID_RULE_MESSAGE),
        nextCardOrderIds: Joi.array()
            .required()
            .items(
                Joi.string()
                    .pattern(OBJECT_ID_RULE)
                    .message(OBJECT_ID_RULE_MESSAGE)
            ),
    });
    try {
        //SET abortEarly flase để có nhiều lỗi validation thì trả về tất cả lỗi
        await correctCondition.validateAsync(req.body, {
            abortEarly: false,
        });
        console.log("validation");
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

export const boardValidation = { creatNew, update, moveCardToDifferentColumn };
