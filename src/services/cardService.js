import { cardModel } from "../models/cardModel";
import { columnModel } from "../models/columnModel";
import { CloudinaryProvider } from "../providers/CloudinaryProvider";

const createNew = async (reqbody) => {
    try {
        const newCard = {
            ...reqbody,
        };

        const createdCard = await cardModel.createNew(newCard);

        const getNewCard = await cardModel.findOneById(createdCard.insertedId);
        if (getNewCard) {
            //Cập nhật mảng cardOrderIds trong collecton columns
            await columnModel.pushCardOrderIds(getNewCard);
        }

        return getNewCard;
    } catch (error) {
        throw error;
    }
};

const update = async (cardId, reqBody, cardCoverFile, userInfo) => {
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
            updatedCard = await cardModel.update(cardId, {
                cover: uploadResult.secure_url,
            });
        } else if (updateData.commentToAdd) {
            //Tạo dữ liệu comment để thêm vào DB
            const commentData = {
                ...updateData.commentToAdd,
                commentedAt: Date.now(),
                userId: userInfo._id,
                userEmail: userInfo.email,
            };
            updatedCard = await cardModel.unshiftNewComment(cardId, commentData);
        } else {
            //Các trường hợp update chung
            updatedCard = await cardModel.update(cardId, updateData);
        }

        return updatedCard;
    } catch (error) {
        throw error;
    }
};
export const cardService = {
    createNew,
    update,
};
