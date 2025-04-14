import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError";
import { JwtProvider } from "../providers/JwtProvider";
import { env } from "../config/environment";

//Middleware này sẽ đảm nhiệm việc quan trọng: Xác thực cái JWT accessToken nhận được từ phía FE có hợp lệ hay không
const isAuthorized = async (req, res, next) => {
    //Lấy accessToken nằm trong request cookies phía client cấu vs withCredentials trong file authorizeAxios
    const clientAccessToken = req.cookies?.accessToken;

    //Nếu như clientAccessToken không tồn tại thì trả về lỗi
    if (!clientAccessToken) {
        next(
            new ApiError(
                StatusCodes.UNAUTHORIZED,
                "Unauthorized! (token not found)"
            )
        );
        return;
    }
    try {
        //Thực hiện giải mã token xem có hợp lệ không
        const accessTokenDecoded = await JwtProvider.verifyToken(
            clientAccessToken,
            env.ACCESS_TOKEN_SECRET_SIGNATURE
        );
        // console.log(accessTokenDecoded);
        //Nếu như token hợp lệ thì lưu thông in giải mã được và req.jwtDecoded, để sử dụng cho các tầng cần xử lý ở phía sau
        req.jwtDecoded = accessTokenDecoded;

        //Cho phép request đi tiếp
        next();
    } catch (error) {
        // console.log("authMiddleware", error);
        //Nếu accessToken bị hết hạn (expired) thì cần trả về một mã lỗi cho phía FE để gọi api refreshToken
        if (error?.message?.includes("jwt expired")) {
            next(new ApiError(StatusCodes.GONE, "Need to refresh token."));
            return;
        }
        //Nếu như accessToken không hợp lệ do bất kỳ điều gì khác vụ hết hạn thì trả về mã 401 phía FE gọi api sign_out
        next(new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized!"));
    }
};

export const authMiddleware = { isAuthorized };
