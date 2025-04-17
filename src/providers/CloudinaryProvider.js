import cloudinary from "cloudinary";
import { env } from "../config/environment";
import streamifier from "streamifier";
//Cấu hình cloudinary, v2
const cloudinaryV2 = cloudinary.v2;
cloudinaryV2.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
});
//Khởi tạo một function để thực hiện upload file lên Cloudinary
const streamUpload = (fileBuffer, folderName) => {
    return new Promise((resolve, reject) => {
        //Tạo một luồng stream upload lên cloudinary
        const stream = cloudinaryV2.uploader.upload_stream(
            { folder: folderName },
            (err, result) => {
                if (err) reject(err);
                else resolve(result);
            }
        );
        //Thực hiện upload luồng trên bằng lib streamfier
        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};
export const CloudinaryProvider = { streamUpload };
