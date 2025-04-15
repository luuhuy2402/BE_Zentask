import { StatusCodes } from "http-status-codes";
import { userService } from "../services/userService";
import ms from "ms";
import ApiError from "../utils/ApiError";

const creatNew = async (req, res, next) => {
    try {
        const createdUser = await userService.createNew(req.body);

        res.status(StatusCodes.CREATED).json(createdUser);
    } catch (error) {
        next(error);
    }
};

const verifyAccount = async (req, res, next) => {
    try {
        const result = await userService.verifyAccount(req.body);

        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const result = await userService.login(req.body);
        /**Xử lý trả về http Only cookie cho phía trình duyệt
         */
        res.cookie("accessToken", result.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: ms("14 days"), //thời gian sống của cookie
        });

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: ms("14 days"), //thời gian sống của cookie
        });

        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        // Xóa cookie
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        res.status(StatusCodes.OK).json({ loggedOut: true });
    } catch (error) {
        next(error);
    }
};
const refreshToken = async (req, res, next) => {
    try {
        const result = await userService.refreshToken(
            req.cookies?.refreshToken
        );
        res.cookie("accessToken", result.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: ms("14 days"),
        });
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(
            new ApiError(
                StatusCodes.FORBIDDEN,
                "Please Sign In! (Error from refresh Token)"
            )
        );
    }
};
export const userController = {
    creatNew,
    verifyAccount,
    login,
    logout,
    refreshToken,
};
