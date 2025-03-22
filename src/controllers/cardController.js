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

export const cardController = { creatNew };
