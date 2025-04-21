import express from "express";
import cors from "cors";
import exitHook from "async-exit-hook";
import { CLOSE_DB, CONNECT_DB, GET_DB } from "./config/mongodb";
import { env } from "./config/environment";
import { APIs_V1 } from "./routes/v1";
import { errorHandlingMiddleware } from "./middlewares/errorHandlingMiddleware";
import { corsOptions } from "./config/cors";
import cookieParser from "cookie-parser";
//Xử lý socket.io
import socketIo from "socket.io";
import http from "http";
import { inviteUserToBoardSocket } from "./sockets/inviteUserToBoardSocket";

const START_SERVER = () => {
    const app = express();

    //Fix dịch vụ cache from disk của expressJS
    app.use((req, res, next) => {
        res.set("Cache-Control", "no-store");
        next();
    });

    //Cấu hình Cookie parser
    app.use(cookieParser());

    //Xử lý cors
    app.use(cors(corsOptions));
    //enable req.body json data
    app.use(express.json());
    // use apis V1
    app.use("/v1", APIs_V1);

    //Middleware xử lý lỗi tập trung
    app.use(errorHandlingMiddleware);

    //Tạo 1 server mới bọc app của express để làm real-time vs socket.io
    const server = http.createServer(app);
    //Khởi tạo biến io với server và cors
    const io = socketIo(server, { cors: corsOptions });
    io.on("connection", (socket) => {
        // Gọi các socket tùy theo tính năng
        inviteUserToBoardSocket(socket);
    });

    //Dùng server.listen thay vì app.listen vì lúc này server đã bao gồm express app và đã config socket.io
    server.listen(env.APP_PORT, env.APP_HOST, () => {
        console.log(
            `3.Back-end Server is running successfully at Host http://${env.APP_HOST}:${env.APP_PORT}/`
        );
    });

    //  Thực hiện các tác vụ cleanup trước khi dừng server
    exitHook(() => {
        console.log("4. Disconnecting from MongoDB Cloud Atlas");
        CLOSE_DB();
    });
};

//Cách 1: Chỉ khi kết nối tới Database thành công thì mới Start Server Back-end lên
//IIFE
(async () => {
    try {
        console.log("1. Connecting to MongoDB Cloud");
        await CONNECT_DB();
        console.log("2. Connected to MongoDB Cloud");

        START_SERVER();
    } catch (error) {
        console.error(error);
        process.exit(0); //nếu có lõi thì dừng server
    }
})();

//Cách 2: Chỉ khi kết nối tới Database thành công thì mới Start Server Back-end lên
// console.log("1. Connecting to MongoDB Cloud");
// CONNECT_DB()
//     .then(() => console.log("2. Connected to MongoDB Cloud"))
//     .then(() => START_SERVER())
//     .catch((error) => {
//         console.error(error);
//         process.exit(0); //nếu có lõi thì dừng server
//     });
