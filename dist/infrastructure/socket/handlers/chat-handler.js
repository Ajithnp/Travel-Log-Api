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
function registerChatHandlers(io, socket, chatRepository) {
    const { userId, role } = socket.data;
    logger_1.default.info(`[Chat Socket] Registered handlers: userId=${userId} role=${role}`);
    // ── Client joins a specific chat room
    // Called when user/vendor opens a chat window
    // Client emits: socket.emit("chat:join", { chatId })
    socket.on(socket_event_1.CHAT_EVENTS.JOIN_ROOM, (_a) => __awaiter(this, [_a], void 0, function* ({ chatId }) {
        try {
            // Guard
            const isAllowed = yield chatRepository.canAccessRoom(chatId, userId, role);
            if (!isAllowed) {
                logger_1.default.warn(`[Chat Socket] Unauthorized join attempt: userId=${userId} chatId=${chatId}`);
                socket.emit('chat:error', { message: 'Access denied to this chat room' });
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
    socket.on(socket_event_1.CHAT_EVENTS.LEAVE_ROOM, (_a) => __awaiter(this, [_a], void 0, function* ({ chatId }) {
        const room = socket_types_1.SocketRooms.forChat(chatId);
        yield socket.leave(room);
        logger_1.default.info(`[Chat Socket] userId=${userId} left room=${room}`);
    }));
    socket.on('disconnect', (reason) => {
        logger_1.default.info(`[Chat Socket] Disconnected: userId=${userId} socketId=${socket.id} reason=${reason}`);
    });
    socket.on('error', (err) => {
        logger_1.default.error(`[Chat Socket] Socket error for userId=${userId}:`, err.message);
    });
}
