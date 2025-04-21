// CORS là một cơ chế bảo mật của trình duyệt cho phép hoặc chặn một trang web gửi yêu cầu đến một miền (origin) khác với miền của trang web đó.
import { env } from "./environment";
import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError";
import { WHITELIST_DOMAINS } from "../utils/constants";

// Cấu hình CORS Option trong dự án thực tế (Video số 62 trong chuỗi MERN Stack Pro)
export const corsOptions = {
    origin: function (origin, callback) {
        //Nếu môi trường là local dev thì cho qua
        if (env.BUILD_MODE === "dev") {
            return callback(null, true);
        }
        //Ngược lại thì hiện tại code còn 1 trường hợp là env.BUILD_MODE === 'production'

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

    // Some legacy browsers (IE11, various SmartTVs) choke on 204
    optionsSuccessStatus: 200,

    // CORS sẽ cho phép nhận cookies từ request
    credentials: true,
};
