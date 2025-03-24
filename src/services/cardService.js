import { cardModel } from "../models/cardModel";
import { columnModel } from "../models/columnModel";

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

export const cardService = {
    createNew,
};
