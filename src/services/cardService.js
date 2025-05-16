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
            await columnModel.pushCardOrderIds(getNewCard);
        }

        return getNewCard;
    } catch (error) {
        throw error;
    }
};

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

const deleteItem = async (cardId) => {
    try {
        const targetCard = await cardModel.findOneById(cardId);
        if (!targetCard) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Card not found!");
        }
        //Xóa column
        await cardModel.deleteOneById(cardId);

        //Xóa columnId trong mảng columnOrderIds của Board chứa column xóa
        // await boardModel.pullColumnOrderIds(targetColumn);
        await columnModel.pullCardOrderIds(targetCard);

        return { deleteResult: "Card deleted successfully" };
    } catch (error) {
        throw error;
    }
};
export const cardService = {
    createNew,
    update,
    deleteItem,
};
