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

        return getNewColumn;
    } catch (error) {
        throw error;
    }
};

export const columnService = {
    createNew,
};
