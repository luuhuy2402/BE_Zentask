import { StatusCodes } from "http-status-codes";
import { activityService } from "../services/activityService";
import ApiError from "../utils/ApiError";

const createNew = async (req, res) => {
    try {
        const result = await activityService.createNewActivity(req.body);
        res.status(StatusCodes.CREATED).json(result);
    } catch (error) {
        throw new ApiError(StatusCodes.BAD_REQUEST, error.message);
    }
};

const getActivitiesByBoard = async (req, res) => {
    try {
        const { boardId } = req.params;
        const result = await activityService.getActivitiesByBoard(boardId);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        throw new ApiError(StatusCodes.BAD_REQUEST, error.message);
    }
};

const getActivityById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await activityService.getActivityById(id);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        throw new ApiError(StatusCodes.BAD_REQUEST, error.message);
    }
};


export const activityController = {
    createNew,
    getActivitiesByBoard,
    getActivityById,
    
};
