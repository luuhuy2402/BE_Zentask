import { StatusCodes } from "http-status-codes";
import { columnService } from "../services/columnService";

const creatNew = async (req, res, next) => {
    try {
        const createdColumn = await columnService.createNew(req.body);

        res.status(StatusCodes.CREATED).json(createdColumn);
    } catch (error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const columnId = req.params.id;
        const updatedColumn = await columnService.update(columnId, req.body);

        res.status(StatusCodes.OK).json(updatedColumn);
    } catch (error) {
        next(error); //sẽ nhảy sang file server vào phần xử lý lỗi tập trung
    }
};
export const columnController = { creatNew, update };
