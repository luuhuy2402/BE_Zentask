import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError";
import {
    ALLOW_COMMON_FILE_TYPES,
    LIMIT_COMMON_FILE_SIZE,
} from "../utils/validators";
import multer from "multer";

//Function kiểm tra loại file nào được chất nhận
const customFileFilter = (req, file, callback) => {
    // console.log("Multer: ", file);
    //Đối với multer kiểm tra kiểu file thì sử dụng mimetype
    if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
        const errMessage =
            "File type is invalid. Only accept jpg, jpeg and png";
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
    limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
    fileFilter: customFileFilter,
});

export const multerUpLoadMiddleware = { upload };
