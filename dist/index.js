"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const http_1 = require("http");
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
require("./config/redis.config");
const logger_1 = __importDefault(require("./config/logger"));
const socket_server_1 = require("./infrastructure/socket/socket.server");
const application = new app_1.default();
const dbConnection = new db_1.ConnectDB();
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dbConnection.connect();
        const httpServer = (0, http_1.createServer)(application.expressApp);
        (0, socket_server_1.initSocketServer)(httpServer);
        httpServer.listen(application.port, () => {
            logger_1.default.info(`HTTP + WebSocket server running on port ${application.port}`);
        });
    }
    catch (error) {
        logger_1.default.error('Failed to start application', error);
        process.exit(1);
    }
}))();
