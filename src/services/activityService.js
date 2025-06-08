import { activityModel } from "../models/activityModel";
import { boardModel } from "../models/boardModel";
import { userModel } from "../models/userModel";
import ApiError from "../utils/ApiError";
import { StatusCodes } from "http-status-codes";

const createNewActivity = async (data) => {
    try {
        // Kiểm tra board có tồn tại không
        const board = await boardModel.findOneById(data.boardId);
        if (!board) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Board not found");
        }

        // Tạo activity mới
        const result = await activityModel.createNew(data);
        return result;
    } catch (error) {
        throw new ApiError(StatusCodes.BAD_REQUEST, error.message);
    }
};

const getActivitiesByBoard = async (boardId) => {
    try {
        // Kiểm tra board có tồn tại không
        const board = await boardModel.findOneById(boardId);
        if (!board) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Board not found");
        }

        // Lấy activities của board
        const activities = await activityModel.getActivitiesByBoard(boardId);

        // Lấy thông tin user cho mỗi activity
        const activitiesWithUser = await Promise.all(
            activities.map(async (activity) => {
                const user = await userModel.findOneById(activity.userId);
                return {
                    ...activity,
                    user: user ? {
                        name: user.username,
                        avatar: user.avatar
                    } : null
                };
            })
        );
        console.log(activitiesWithUser)

        return activitiesWithUser;
    } catch (error) {
        throw new ApiError(StatusCodes.BAD_REQUEST, error.message);
    }
};

const getActivityById = async (activityId) => {
    try {
        const result = await activityModel.findOneById(activityId);
        if (!result) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Activity not found");
        }
        return result;
    } catch (error) {
        throw new ApiError(StatusCodes.BAD_REQUEST, error.message);
    }
};

export const activityService = {
    createNewActivity,
    getActivitiesByBoard,
    getActivityById,
};
