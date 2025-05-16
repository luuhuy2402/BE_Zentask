import cloudinary from "cloudinary";
import { env } from "../config/environment";
import streamifier from "streamifier";
import { cardModel } from "../models/cardModel";
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
            { folder: folderName, resource_type: "auto" },
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
const update = async (
    cardId,
    reqBody,
    cardCoverFile,
    attachmentFile,
    userInfo
) => {
    try {
        const updateData = {
            ...reqBody,
            updatedAt: Date.now(),
        };
        let updatedCard = {};
        if (cardCoverFile) {
            const uploadResult = await CloudinaryProvider.streamUpload(
                cardCoverFile.buffer,
                "card-cover"
            );
            // console.log("uploadResult", uploadResult);
            updatedCard = await cardModel.update(cardId, {
                cover: uploadResult.secure_url,
            });
        } else if (attachmentFile) {
            const uploadResult = await CloudinaryProvider.streamUpload(
                attachmentFile.buffer,
                "attachment"
            );
            // console.log("uploadResult", uploadResult);
            // let fileUrl = uploadResult.secure_url;
            // // Xử lý URL đặc biệt cho PDF - thêm fl_attachment để buộc trình duyệt tải xuống
            // if (uploadResult.format === "pdf") {
            //     fileUrl = fileUrl.replace("/upload/", "/upload/fl_attachment/");
            // }
            updatedCard = await cardModel.unshiftAttachment(
                cardId,
                uploadResult.secure_url
            );
            // console.log("updatedCard", updatedCard);
        } else if (updateData.commentToAdd) {
            const commentData = {
                ...updateData.commentToAdd,
                commentedAt: Date.now(),
                userId: userInfo._id,
                userEmail: userInfo.email,
            };
            updatedCard = await cardModel.unshiftNewComment(
                cardId,
                commentData
            );
        } else if (updateData.incomingMemberInfo) {
            //Ađ hoặc remove thành viên ra khỏi card
            updatedCard = await cardModel.updateMembers(
                cardId,
                updateData.incomingMemberInfo
            );
        } else {
            //Các trường hợp update chung
            updatedCard = await cardModel.update(cardId, updateData);
        }

        return updatedCard;
    } catch (error) {
        throw error;
    }
};
