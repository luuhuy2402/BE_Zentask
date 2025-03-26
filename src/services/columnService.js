import { get } from "lodash";
import { boardModel } from "../models/boardModel";
import { columnModel } from "../models/columnModel";

const createNew = async (reqbody) => {
    try {
        const newColumn = {
            ...reqbody,
        };

        const createdColumn = await columnModel.createNew(newColumn);

        const getNewColumn = await columnModel.findOneById(
            createdColumn.insertedId
        );

        if (getNewColumn) {
            // Xử lý cấu truc da data trc khi trả dữ liệu về
            getNewColumn.cards = [];

            //Cập nhật mảng columnOrderIds trong collecton boards
            await boardModel.pushColumnOrderIds(getNewColumn);
        }
        return getNewColumn;
    } catch (error) {
        throw error;
    }
};
const update = async (columnId, reqBody) => {
    try {
        //cần truyền thên updatedAt để cập nhật thời gian cập nhật
        const updateData = { ...reqBody, updateAt: Date.now() };

        const updatedColumn = await columnModel.update(columnId, updateData);

        return updatedColumn;
    } catch (error) {
        throw error;
    }
};
export const columnService = {
    createNew,
    update,
};
