import { StatusCodes } from "http-status-codes";
import { userModel } from "../models/userModel";
import ApiError from "../utils/ApiError";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { pickUser } from "../utils/formatters";
import { WEBSITE_DOMAIN } from "../utils/constants";
import { BrevoProvider } from "../providers/BrevoProvider";
import { JwtProvider } from "../providers/JwtProvider";
import { env } from "../config/environment";
import { CloudinaryProvider } from "../providers/CloudinaryProvider";

const createNew = async (reqBody) => {
    try {
        //Kiểm tra xem email đã tồn tại trong hệ thống chưa
        const existUser = await userModel.findOneByEmail(reqBody.email);
        if (existUser) {
            throw new ApiError(StatusCodes.CONFLICT, "Email already exists!");
        }
        //Tạo data để lưu vào Database
        //nameFromEmail: nếu email là xeoxeo@gmail.com thì sẽ lấy được "xeoxeo"
        const nameFromEmail = reqBody.email.split("@")[0];
        const newUser = {
            email: reqBody.email,
            password: bcrypt.hashSync(reqBody.password, 8), //tham số thứ 2 là độ phức tạp
            username: nameFromEmail,
            displayName: nameFromEmail,
            verifyToken: uuidv4(),
        };
        //Thực hiện lưu thông tin user vào Database
        const createdUser = await userModel.createNew(newUser);
        const getNewUser = await userModel.findOneById(createdUser.insertedId);
        //Gửi email cho người dùng xác thực tài khoản
        const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`;
        const customSubject =
            "Zentask MERN Stack Advanced: Please verify your email before using our services!";
        const htmlContent = `
            <h3>Here is your verification link:</h3>
            <h3>${verificationLink}</h3>
            <h3>Sincerely,<br/>- Luu Hieu</h3>
        `;
        //Gọi tới cái Provider gửi mail
        await BrevoProvider.sendEmail(
            getNewUser.email,
            customSubject,
            htmlContent
        );

        //return trả về dữ liệu về Controller
        return pickUser(getNewUser);
    } catch (error) {
        throw error;
    }
};

const verifyAccount = async (reqBody) => {
    try {
        //Query user trong Database
        const existUser = await userModel.findOneByEmail(reqBody.email);

        //Các bước kiểm tra
        if (!existUser)
            throw new ApiError(StatusCodes.NOT_FOUND, "Account not found!");

        if (existUser.isActive)
            throw new ApiError(
                StatusCodes.NOT_ACCEPTABLE,
                "Your account is already active!"
            );
        if (reqBody.token !== existUser.verifyToken)
            throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Token is invalid!");

        //Nếu mọi thứ ổn thì sẽ update lại thông tin user để verify account
        const updateData = {
            isActive: true,
            verifyToken: null,
        };

        const updatedUser = await userModel.update(existUser._id, updateData);
        return pickUser(updatedUser);
    } catch (error) {
        throw error;
    }
};

const login = async (reqBody) => {
    try {
        //Query user trong Database
        const existUser = await userModel.findOneByEmail(reqBody.email);

        //Các bước kiểm tra
        if (!existUser)
            throw new ApiError(StatusCodes.NOT_FOUND, "Account not found!");

        if (!existUser.isActive)
            throw new ApiError(
                StatusCodes.NOT_ACCEPTABLE,
                "Your account is not active!"
            );
        if (!bcrypt.compareSync(reqBody.password, existUser.password)) {
            throw new ApiError(
                StatusCodes.NOT_ACCEPTABLE,
                "Your Email or Password is incorrect!"
            );
        }

        //Nếu oke thì tạo Tokens đăng nhập để trả về cho phía FE
        //Thông tin sẽ đính kèm trong JWT token bao gồm _id và email của uer
        const userInfo = {
            _id: existUser._id,
            email: existUser.email,
        };
        //Tạo ra 2 loại token, accessToken và refreshToken để trả về phía FE
        const accessToken = await JwtProvider.generateToken(
            userInfo,
            env.ACCESS_TOKEN_SECRET_SIGNATURE,
            // 5 //5 giây
            env.ACCESS_TOKEN_LIFE
        );

        const refreshToken = await JwtProvider.generateToken(
            userInfo,
            env.REFRESH_TOKEN_SECRET_SIGNATURE,
            env.REFRESH_TOKEN_LIFE
        );

        //Trả về thông tin của user kèm theo 2 cái token vừa tạo
        return { accessToken, refreshToken, ...pickUser(existUser) };
    } catch (error) {
        throw error;
    }
};

const refreshToken = async (clientRefreshToken) => {
    try {
        //Verify / giải mã refresh token
        const refreshTokenDecoded = await JwtProvider.verifyToken(
            clientRefreshToken,
            env.REFRESH_TOKEN_SECRET_SIGNATURE
        );
        const userInfo = {
            _id: refreshTokenDecoded._id,
            email: refreshTokenDecoded.email,
        };

        //Tạo access Token mới
        const accessToken = await JwtProvider.generateToken(
            userInfo,
            env.ACCESS_TOKEN_SECRET_SIGNATURE,
            env.ACCESS_TOKEN_LIFE
            // 5
        );
        return { accessToken };
    } catch (error) {
        throw error;
    }
};
const update = async (userId, reqBody, userAvatarFile) => {
    try {
        /**Query User và kiểm tra */
        const existUser = await userModel.findOneById(userId);
        if (!existUser)
            throw new ApiError(StatusCodes.NOT_FOUND, "Account not found!");
        if (!existUser.isActive)
            throw new ApiError(
                StatusCodes.NOT_ACCEPTABLE,
                "Your account is not active!"
            );
        //Khởi tạo kết quả updated User ban đầu là empty
        let updatedUser = {};
        //TH change password
        if (reqBody.current_password && reqBody.new_password) {
            //Kiểm tra xem current_password đúng ko
            if (
                !bcrypt.compareSync(
                    reqBody.current_password,
                    existUser.password
                )
            ) {
                throw new ApiError(
                    StatusCodes.NOT_ACCEPTABLE,
                    "Your Current Password is incorrect!"
                );
            }
            //Nếu current_password đúng thì hash password mới và update vào DB
            updatedUser = await userModel.update(userId, {
                password: bcrypt.hashSync(reqBody.new_password, 8),
            });
        } else if (userAvatarFile) {
            //Trường hợp upload file lên Cloud Stỏage: Cloudinary
            const uploadResult = await CloudinaryProvider.streamUpload(
                userAvatarFile.buffer,
                "users"
            );
            console.log(" uploadResult", uploadResult);

            //Lưu lại url của file ảnh vào DB
            updatedUser = await userModel.update(userId, {
                avatar: uploadResult.secure_url,
            });
        } else {
            //TH update các thông tin chung như displayname
            updatedUser = await userModel.update(userId, reqBody);
        }
        return pickUser(updatedUser);
    } catch (error) {
        throw error;
    }
};
export const userService = {
    createNew,
    verifyAccount,
    login,
    refreshToken,
    update,
};
