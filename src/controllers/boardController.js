// xử lý các điều hướng
import { StatusCodes } from "http-status-codes";
import { boardService } from "../services/boardService";

const creatNew = async (req, res, next) => {
    try {
        //Điều hướng dữ liệu sang tầng Service
        const createdBoard = await boardService.createNew(req.body);

        //Có kết quả thì trả về phía client
        res.status(StatusCodes.CREATED).json(createdBoard);
    } catch (error) {
        next(error); //sẽ nhảy sang file server vào phần xử lý lỗi tập trung
    }
};

const getDetails = async (req, res, next) => {
    try {
        const boardId = req.params.id;
        //sẽ có thêm userId để chỉ lấy board thuộc về user đó,...
        const board = await boardService.getDetails(boardId);
        res.status(StatusCodes.OK).json(board);
    } catch (error) {
        next(error); //sẽ nhảy sang file server vào phần xử lý lỗi tập trung
    }
};

const update = async (req, res, next) => {
    try {
        const boardId = req.params.id;
        const updatedBoard = await boardService.update(boardId, req.body);

        res.status(StatusCodes.OK).json(updatedBoard);
    } catch (error) {
        next(error); //sẽ nhảy sang file server vào phần xử lý lỗi tập trung
    }
};

const moveCardToDifferentColumn = async (req, res, next) => {
    try {
        const result = await boardService.moveCardToDifferentColumn(req.body);

        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error); //sẽ nhảy sang file server vào phần xử lý lỗi tập trung
    }
};

const getBoards = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded._id;
        //page và itemsPerPage được truyền vào trong query url từ FE nên BE lấy thông qua req.query
        const { page, itemsPerPage } = req.query;
        const results = await boardService.getBoards(
            userId,
            page,
            itemsPerPage
        );
        res.status(StatusCodes.OK).json(results);
    } catch (error) {
        next(error);
    }
};

export const boardController = {
    creatNew,
    getDetails,
    update,
    moveCardToDifferentColumn,
    getBoards,
};
