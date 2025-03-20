import express from "express";
import cors from "cors";
import exitHook from "async-exit-hook";
import { CLOSE_DB, CONNECT_DB, GET_DB } from "./config/mongodb";
import { env } from "./config/environment";
import { APIs_V1 } from "./routes/v1";
import { errorHandlingMiddleware } from "./middlewares/errorHandlingMiddleware";
import { corsOptions } from "./config/cors";

const START_SERVER = () => {
    const app = express();

    //Xử lý cors
    app.use(cors(corsOptions));
    //enable req.body json data
    app.use(express.json());
    // use apis V1
    app.use("/v1", APIs_V1);

    //Middleware xử lý lỗi tập trung
    app.use(errorHandlingMiddleware);

    app.listen(env.APP_PORT, env.APP_HOST, () => {
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
