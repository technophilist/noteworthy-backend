import dotEnv from "dotenv";

let isDevBuild: boolean;
if (process.argv[2] && process.argv[2] === "prod") {
    isDevBuild = false
    dotEnv.config({path: import.meta.dirname + "/../../.env"})
} else {
    isDevBuild = true
    dotEnv.config({path: import.meta.dirname + "/../../.dev.env"})
}

export default {
    isDevBuild: isDevBuild,
    server: {
        listenPort: process.env.SERVER_LISTEN_PORT
    },
    dbConfig: {
        hostName: process.env.DB_HOST_NAME,
        username: process.env.DB_USER_NAME,
        password: process.env.DB_PASSWORD,
        databaseName: process.env.DB_DATABASE_NAME,
    }
}
