import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError";
import {
    ALLOW_ATTACHMENT_FILE_TYPES,
    LIMIT_ATTACHMENT_FILE_SIZE,
} from "../utils/validators";
import multer from "multer";

const customFileFilter = (req, file, callback) => {
    if (!ALLOW_ATTACHMENT_FILE_TYPES.includes(file.mimetype)) {
        const errMessage =
            "File type is invalid. Only accept jpg, jpeg, png, pdf, docx, xlsx,...";
        return callback(
            new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMessage),
            null
        );
    }
    //Nếu như kiểu file hợp lệ
    return callback(null, true);
};

//Khởi tạo Function upload được bọc bởi multer
const upload = multer({
    limits: { fileSize: LIMIT_ATTACHMENT_FILE_SIZE },
    fileFilter: customFileFilter,
});

export const multerUpLoadAttachmentMiddleware = { upload };
