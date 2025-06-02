import { StatusCodes } from "http-status-codes";
import { boardModel } from "../models/boardModel";
import { userModel } from "../models/userModel";
import ApiError from "../utils/ApiError";
import { pickUser } from "../utils/formatters";
import { BOARD_INVITATION_STATUS, INVITATION_TYPES } from "../utils/constants";
import { invitationModel } from "../models/invitationModel";

const createNewBoardInvitation = async (reqBody, inviterId) => {
    try {
        //Người đi mời: Là người đâng request => tìm theo id lấy tù token
        const inviter = await userModel.findOneById(inviterId);
        //Người được mòi lấy the oemail nhận từ phía FE
        const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail);
        //Tìm board để lấy data xủ lý
        const board = await boardModel.findOneById(reqBody.boardId);
        //Nếu k cs tòn tại 1 trng 3 thì reject
        if (!invitee || !inviter || !board) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                "Inviter, Invitee or Board not found!"
            );
        }

        //Tạo data cần thiết để lưu vào DB
        const newInvitationData = {
            inviterId,
            inviteeId: invitee._id.toString(), // chuyẻn từ ObjectId sang string để bên model check lại data
            type: INVITATION_TYPES.BOARD_INVITATION,
            boardInvitation: {
                boardId: board._id.toString(),
                status: BOARD_INVITATION_STATUS.PENDING, // Default trạng thái ban đầu là Pending
            },
        };

        //Gọi sang Model để lưu và DB
        const createdInvitation =
            await invitationModel.createNewBoardInvitation(newInvitationData);
        const getInvitation = await invitationModel.findOneById(
            createdInvitation.insertedId
        );

        //Ngoài thông tin của board invitation mói tạo thì trả về đủ ả luôn board, inviter, invitee, cho FE xủ lý
        const resInvitation = {
            ...getInvitation,
            board,
            inviter: pickUser(inviter),
            invitee: pickUser(invitee),
        };
        return resInvitation;
    } catch (error) {
        throw error;
    }
};

const getInvitations = async (userId) => {
    try {
        const getInvitations = await invitationModel.findByUser(userId);
        // console.log("getInvitations", getInvitations);
        //Vì các dữ liệu inviter, invitee và board là giá trị mảng một phần tử => biến đổi về JsonObject trước khi trả về cho FE
        const resInvitations = getInvitations.map((i) => {
            return {
                ...i,
                inviter: i.inviter[0] || {},
                invitee: i.invitee[0] || {},
                board: i.board[0] || {},
            };
        });
        return resInvitations;
    } catch (error) {
        throw error;
    }
};

const updateBoardInvitation = async (userId, invitationId, status) => {
    try {
        //Tìm bản ghi invitation trong model
        const getInvitation = await invitationModel.findOneById(invitationId);
        if (!getInvitation)
            throw new ApiError(StatusCodes.NOT_FOUND, "Invitation not found!");

        //Sau khi có Invitation thì lấy full thông tin của board
        const boardId = getInvitation.boardInvitation.boardId;
        const getBoard = await boardModel.findOneById(boardId);
        if (!getBoard)
            throw new ApiError(StatusCodes.NOT_FOUND, "Board not found!");
        //Kiểm tra xem nếu status  là ACCEPTED join board mà user(invitee) đã là owner hoặc member của board rồi thì trả về lỗi
        //2 mảng memberIds và ownerIds của board đang là kiểu ObjectId nen chuyển về String để check
        const boardOwnerAndMemberIds = [
            ...getBoard.ownerIds,
            ...getBoard.memberIds,
        ].toString();
        if (
            status === BOARD_INVITATION_STATUS.ACCEPTED &&
            boardOwnerAndMemberIds.includes(userId)
        ) {
            throw new ApiError(
                StatusCodes.NOT_ACCEPTABLE,
                "You are already a member of this board!"
            );
        }
        //tạo dữ liệu để update bản ghi invitation
        const updateData = {
            boardInvitation: {
                ...getInvitation.boardInvitation,
                status: status,
            },
        };
        //B1: Cập nhật status trong bản ghi Invitation
        const updatedInvitation = await invitationModel.update(
            invitationId,
            updateData
        );
        //B2: Nếu trường hợp Accept một lời mời thành công thì cần phải thêm
        // thoogn tin của user(userId) vào bản ghi memberIds trong collection board
        if (
            updatedInvitation.boardInvitation.status ===
            BOARD_INVITATION_STATUS.ACCEPTED
        ) {
            await boardModel.pushMemberIds(boardId, userId);
        }
        return updatedInvitation;
    } catch (error) {
        throw error;
    }
};

const deleteItem = async (invitationId) => {
    try {
        await invitationModel.deleteOneById(invitationId);

        return { deleteResult: "Invitation deleted successfully" };
    } catch (error) {
        throw error;
    }
};
export const invitationService = {
    createNewBoardInvitation,
    getInvitations,
    updateBoardInvitation,
    deleteItem,
};
