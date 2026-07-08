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
exports.registerChatHandlers = registerChatHandlers;
const socket_types_1 = require("../types/socket.types");
const socket_event_1 = require("../types/socket.event");
const logger_1 = __importDefault(require("../../../config/logger"));
const tsyringe_1 = require("tsyringe");
const roles_1 = require("../../../shared/constants/roles");
function registerChatHandlers(io, socket, chatRepository) {
    const { userId, role } = socket.data;
    logger_1.default.info(`[Chat Socket] Registered handlers: userId=${userId} role=${role}`);
    // ── Client joins a specific chat room
    socket.on(socket_event_1.CHAT_EVENTS.JOIN_ROOM, (_a) => __awaiter(this, [_a], void 0, function* ({ chatId }) {
        try {
            // Guard
            const isAllowed = yield chatRepository.canAccessRoom(chatId, userId, role);
            if (!isAllowed) {
                logger_1.default.warn(`[Chat Socket] Unauthorized join attempt: userId=${userId} chatId=${chatId}`);
                socket.emit(socket_event_1.CHAT_EVENTS.CHAT_ERROR, { message: 'Access denied to this chat room' });
                return;
            }
            const room = socket_types_1.SocketRooms.forChat(chatId);
            yield socket.join(room);
            logger_1.default.info(`[Chat Socket] userId=${userId} joined room=${room}`);
        }
        catch (err) {
            logger_1.default.error(`[Chat Socket] join_room error for userId=${userId}:`, err);
        }
    }));
    socket.on(socket_event_1.CHAT_EVENTS.SEND_NEW_VENDOR_MESSAGE, (_a) => __awaiter(this, [_a], void 0, function* ({ chatId, content }) {
        try {
            const chatService = tsyringe_1.container.resolve('IChatService');
            const senderId = socket.data.userId;
            const senderName = socket.data.userName || roles_1.USER_ROLES.VENDOR;
            if (!senderId) {
                logger_1.default.warn(`[Chat Socket] Unauthorized send message attempt: chatId=${chatId}`);
                socket.emit(socket_event_1.CHAT_EVENTS.CHAT_ERROR, { message: 'Unauthorized' });
                return;
            }
            yield chatService.sendVendorMessage(chatId, senderId, senderName, content);
        }
        catch (err) {
            socket.emit(socket_event_1.CHAT_EVENTS.CHAT_ERROR, { message: 'Failed to send message' });
            logger_1.default.error(`[Chat Socket] send_new_vendor_message error for userId=${userId}:`, err);
        }
    }));
    socket.on(socket_event_1.CHAT_EVENTS.SEND_NEW_USER_MESSAGE, (_a) => __awaiter(this, [_a], void 0, function* ({ chatId, content }) {
        try {
            const chatService = tsyringe_1.container.resolve('IChatService');
            const senderId = socket.data.userId;
            const senderName = socket.data.userName;
            if (!senderId) {
                logger_1.default.warn(`[Chat Socket] Unauthorized send message attempt: chatId=${chatId}`);
                socket.emit(socket_event_1.CHAT_EVENTS.CHAT_ERROR, { message: 'Unauthorized' });
                return;
            }
            yield chatService.sendUserMessage(chatId, senderId, senderName, content);
        }
        catch (err) {
            socket.emit(socket_event_1.CHAT_EVENTS.CHAT_ERROR, { message: 'Failed to send message' });
            logger_1.default.error(`[Chat Socket] send_new_vendor_message error for userId=${userId}:`, err);
        }
    }));
    socket.on(socket_event_1.CHAT_EVENTS.LEAVE_ROOM, (_a) => __awaiter(this, [_a], void 0, function* ({ chatId }) {
        const room = socket_types_1.SocketRooms.forChat(chatId);
        yield socket.leave(room);
        logger_1.default.info(`[Chat Socket] userId=${userId} left room=${room}`);
    }));
    socket.on(socket_event_1.CONNECTION_EVENTS.DISCONNECT, (reason) => {
        logger_1.default.info(`[Chat Socket] Disconnected: userId=${userId} socketId=${socket.id} reason=${reason}`);
    });
    socket.on(socket_event_1.CONNECTION_EVENTS.ERROR, (err) => {
        logger_1.default.error(`[Chat Socket] Socket error for userId=${userId}:`, err.message);
    });
}
