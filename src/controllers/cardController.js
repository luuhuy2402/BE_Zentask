import { StatusCodes } from "http-status-codes";
import { cardService } from "../services/cardService";

const creatNew = async (req, res, next) => {
    try {
        const createdCard = await cardService.createNew(req.body);

        res.status(StatusCodes.CREATED).json(createdCard);
    } catch (error) {
        next(error);
    }
};
const update = async (req, res, next) => {
    try {
        const cardId = req.params.id;
        const updateCard = await cardService.update(cardId, req.body);
        res.status(StatusCodes.OK).json(updateCard);
    } catch (error) {
        next(error);
    }
};
export const cardController = { creatNew, update };
