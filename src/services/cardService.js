import { cardModel } from "../models/cardModel";

const createNew = async (reqbody) => {
    try {
        const newCard = {
            ...reqbody,
        };

        const createdCard = await cardModel.createNew(newCard);

        const getNewCard = await cardModel.findOneById(createdCard.insertedId);

        return getNewCard;
    } catch (error) {
        throw error;
    }
};

export const cardService = {
    createNew,
};
