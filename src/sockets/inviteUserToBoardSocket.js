// xử lý real time ( tg thực )
//param socket được lấy từ thư viện 
export const inviteUserToBoardSocket = (socket) => {
    // console.log("a user connected", socket);
    //Lắng nghe sự kiện mà client emit lên có tên FE_USER_INVITED_TO_BOARD
    socket.on("FE_USER_INVITED_TO_BOARD", (invitation) => {
        //Emit ngược lại một sự kiện về cho mọi client khác(ngoại trừ chính cái uer gửi request lên) rồi để phía FE check
        socket.broadcast.emit("BE_USER_INVITED_TO_BOARD", invitation);
    });
};
