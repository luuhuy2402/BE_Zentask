import { StatusCodes } from "http-status-codes";
import { cardService } from "../services/cardService";

const createNew = async (req, res, next) => {
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
        // const cardCoverFile = req.file;
        const cardCoverFile = req.files?.cardCover?.[0];
        const attachmentFile = req.files?.attachment?.[0];
        // const attachmentFile = req.file;
        // console.log("cardCoverFile", cardCoverFile);
        console.log("attachmentFile", attachmentFile);

        const userInfo = req.jwtDecoded;
        const updateCard = await cardService.update(
            cardId,
            req.body,
            cardCoverFile,
            attachmentFile,
            userInfo
        );
        res.status(StatusCodes.OK).json(updateCard);
    } catch (error) {
        next(error);
    }
};
const deleteItem = async (req, res, next) => {
    try {
        const cardId = req.params.id;
        const result = await cardService.deleteItem(cardId);

        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};
export const cardController = { createNew, update, deleteItem };
