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
export const invitationService = { createNewBoardInvitation, getInvitations };
