// CORS là một cơ chế bảo mật của trình duyệt cho phép hoặc chặn một trang web gửi yêu cầu đến một miền (origin) khác với miền của trang web đó.
import { env } from "./environment";
import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError";
import { WHITELIST_DOMAINS } from "../utils/constants";

export const corsOptions = {
    origin: function (origin, callback) {
        if (env.BUILD_MODE === "dev") {
            return callback(null, true);
        }
        // Kiểm tra dem origin có phải là domain được chấp nhận hay không
        if (WHITELIST_DOMAINS.includes(origin)) {
            return callback(null, true);
        }
        // Cuối cùng nếu domain không được chấp nhận thì trả về lỗi
        return callback(
            new ApiError(
                StatusCodes.FORBIDDEN,
                `${origin} not allowed by our CORS Policy.`
            )
        );
    },
    optionsSuccessStatus: 200,
    // CORS sẽ cho phép nhận cookies từ request
    credentials: true,
};
