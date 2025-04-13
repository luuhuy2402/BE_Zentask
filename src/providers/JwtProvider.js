import JWT from "jsonwebtoken";

/**
 * Function tạo mới một token - Cần 3 tham số
 * userInfo: Những thông tin muốn đính kèm vào token
 * secretSignature: Chữ ký bí mật (dạng muột chuỗi string ngẫu nhiên)
 * tokenLife: Thời gian sống của token
 */
const generateToken = async (userInfo, secretSignature, tokenLife) => {
    try {
        //Hàm sign() của thư viện Jwt - Thuật toán mặc định là HS256
        return JWT.sign(userInfo, secretSignature, {
            algorithm: "HS256",
            expiresIn: tokenLife,
        });
    } catch (error) {
        throw new Error(error);
    }
};

/**
 * Function kiểm tra một token có hợp lệ không
 * Hợp lệ token được tạo ra đúng với chữ ký bí mật secretSignature trong dự án
 */
const verifyToken = async (token, secretSignature) => {
    try {
        //Hàm verify của thư viện Jwt
        return JWT.verify(token, secretSignature);
    } catch (error) {
        throw new Error(error);
    }
};

export const JwtProvider = { generateToken, verifyToken };
