import "reflect-metadata";
import logger from "./shared/utils/logger";
import App from "./app";
import { ConnectDB } from "./config/db";


const application = new App();
const dbConnection = new ConnectDB();


(async () => {
    try {
        await dbConnection.connect();
        application.start();
    } catch (error) {
        console.error("Failed to start the application:", error);
        process.exit(1);
    }
})();