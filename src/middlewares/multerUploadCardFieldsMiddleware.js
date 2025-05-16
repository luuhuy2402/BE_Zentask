import multer from "multer";
import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError";

import {
    ALLOW_COMMON_FILE_TYPES,
    LIMIT_COMMON_FILE_SIZE,
    ALLOW_ATTACHMENT_FILE_TYPES,
    LIMIT_ATTACHMENT_FILE_SIZE,
} from "../utils/validators";

// Custom file filter kết hợp kiểm tra từng trường
const customFileFilter = (req, file, callback) => {
    const { mimetype, fieldname } = file;

    if (fieldname === "cardCover") {
        if (!ALLOW_COMMON_FILE_TYPES.includes(mimetype)) {
            return callback(
                new ApiError(
                    StatusCodes.UNPROCESSABLE_ENTITY,
                    "File type for cardCover is invalid. Only accept jpg, jpeg, png"
                ),
                null
            );
        }
    }

    if (fieldname === "attachment") {
        if (!ALLOW_ATTACHMENT_FILE_TYPES.includes(mimetype)) {
            return callback(
                new ApiError(
                    StatusCodes.UNPROCESSABLE_ENTITY,
                    "File type for attachment is invalid. Only accept jpg, jpeg, png, pdf, docx, xlsx,..."
                ),
                null
            );
        }
    }

    return callback(null, true);
};

// Set kích thước tối đa tùy theo từng loại file
const upload = multer({
    limits: {
        // Note: Multer không hỗ trợ giới hạn file riêng theo field, bạn phải giới hạn chung ở middleware hoặc xử lý thủ công sau này
        fileSize: Math.max(LIMIT_COMMON_FILE_SIZE, LIMIT_ATTACHMENT_FILE_SIZE),
    },
    fileFilter: customFileFilter,
});

export const multerUploadCardFieldsMiddleware = upload.fields([
    { name: "cardCover", maxCount: 1 },
    { name: "attachment", maxCount: 20 },
]);
