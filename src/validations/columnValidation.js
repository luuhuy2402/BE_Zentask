import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import ApiError from "../utils/ApiError";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "../utils/validators";

const creatNew = async (req, res, next) => {
    const correctCondition = Joi.object({
        boardId: Joi.string()
            .required()
            .pattern(OBJECT_ID_RULE)
            .message(OBJECT_ID_RULE_MESSAGE),
        title: Joi.string().required().min(3).max(50).trim().strict(),
    });
    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false });

        next();
    } catch (error) {
        const errorMessage = new Error(error).message;
        const customError = new ApiError(
            StatusCodes.UNPROCESSABLE_ENTITY,
            errorMessage
        );
        next(customError);
    }
};

const update = async (req, res, next) => {
    //Chú ý ko dùng require khi update
    const correctCondition = Joi.object({
        //làm di chuyển column sang board khác mới cần validate boarId
        // boardId: Joi.string()
        //     .pattern(OBJECT_ID_RULE)
        //     .message(OBJECT_ID_RULE_MESSAGE),
        title: Joi.string().min(3).max(50).trim().strict(),
        cardOrderIds: Joi.array().items(
            Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
        ),
    });
    try {
        //SET abortEarly flase để có nhiều lỗi validation thì trả về tất cả lỗi
        await correctCondition.validateAsync(req.body, {
            abortEarly: false,
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

export const columnValidation = { creatNew, update };
