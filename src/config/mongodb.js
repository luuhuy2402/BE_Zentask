import { MongoClient, ServerApiVersion } from "mongodb";
import { env } from "./environment";

let zentaskDatabaseInstance = null;
const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});
export const CONNECT_DB = async () => {
    await mongoClientInstance.connect();
    zentaskDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME);
};

export const CLOSE_DB = async () => {
    await mongoClientInstance.close();
};

export const GET_DB = () => {
    if (!zentaskDatabaseInstance)
        throw new Error("Must connect to Database first!");
    return zentaskDatabaseInstance;
};
