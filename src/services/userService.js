import { StatusCodes } from "http-status-codes";
import { userModel } from "../models/userModel";
import ApiError from "../utils/ApiError";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { pickUser } from "../utils/formatters";

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
        //return trả về dữ liệu về Controller
        return pickUser(getNewUser);
    } catch (error) {
        throw error;
    }
};

export const userService = { createNew };
