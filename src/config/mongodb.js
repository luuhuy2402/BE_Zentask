import { MongoClient, ServerApiVersion } from "mongodb";
import { env } from "./environment";

// Khởi tạo một đối tượng zentaskDatabaseInstance ban đầu là null (vì chúng ta chưa connect)
let zentaskDatabaseInstance = null;
// Khởi tạo một đối tượng mongoClientInstance để connect tới mongo
const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});
// Kết nối tới Database
export const CONNECT_DB = async () => {
    // Gọi kết nối tới MongoDB Atlas với URI  đã khai báo trong thân của mongoClientInstance
    await mongoClientInstance.connect();
    // Kết nối thành công thì lấy ra Database theo tên và gán ngược nó tại vào biến zentaskDatabaseInstance
    zentaskDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME);
};

// Đóng kết nối tới Database khi cần
export const CLOSE_DB = async () => {
    await mongoClientInstance.close();
};

// Function này có nhiệm vụ export ra cái zentaskDatabaseInstance sau khi đã kết nối thành công tới MongoDB
export const GET_DB = () => {
    if (!zentaskDatabaseInstance)
        throw new Error("Must connect to Database first!");
    return zentaskDatabaseInstance;
};
