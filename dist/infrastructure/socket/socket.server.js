"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocketServer = initSocketServer;
const socket_io_1 = require("socket.io");
const tsyringe_1 = require("tsyringe");
const env_1 = require("../../config/env");
const logger_1 = __importDefault(require("../../config/logger"));
const di_tokens_1 = require("../../shared/constants/di.tokens");
const socket_middleware_1 = require("./socket.middleware");
const notification_handler_1 = require("./handlers/notification-handler");
const notification_emitter_1 = require("./namespaces/notification-emitter");
const chat_handler_1 = require("./handlers/chat-handler");
const chat_emitter_1 = require("./namespaces/chat-emitter");
function initSocketServer(httpServer) {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: env_1.config.cors.ALLOWED_ORIGINS,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            credentials: true,
        },
        pingInterval: 25000,
        pingTimeout: 5000,
        maxHttpBufferSize: 1e6,
        transports: ['websocket', 'polling'],
    });
    io.use((socket, next) => {
        (0, socket_middleware_1.socketAuthMiddleware)(socket, next);
    });
    const notificationRepository = tsyringe_1.container.resolve(di_tokens_1.REPOSITORY_TOKENS.NOTIFICATION_REPOSITORY);
    const userRepository = tsyringe_1.container.resolve(di_tokens_1.REPOSITORY_TOKENS.USER_REPOSITORY);
    const chatRepository = tsyringe_1.container.resolve(di_tokens_1.REPOSITORY_TOKENS.CHAT_REPOSITORY);
    // ── Connection handler(fires every time a new user connects)
    io.on('connection', (socket) => {
        (0, notification_handler_1.registerNotificationHandlers)(io, socket, notificationRepository, userRepository);
        (0, chat_handler_1.registerChatHandlers)(io, socket, chatRepository);
    });
    // ANY service can call:
    // notificationEmitter.send(target, payload)
    notification_emitter_1.notificationEmitter.init(io);
    chat_emitter_1.chatEmitter.init(io);
    logger_1.default.info(`[Socket.IO] Server initialized | Origins: ${Array.isArray(env_1.config.cors.ALLOWED_ORIGINS)
        ? env_1.config.cors.ALLOWED_ORIGINS.join(', ')
        : env_1.config.cors.ALLOWED_ORIGINS}`);
    return io;
}
