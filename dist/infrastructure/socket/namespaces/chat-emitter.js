"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatEmitter = exports.ChatEmitter = void 0;
const logger_1 = __importDefault(require("../../../config/logger"));
const socket_types_1 = require("../types/socket.types");
const socket_event_1 = require("../types/socket.event");
class ChatEmitter {
    constructor() {
        this.io = null;
    }
    static getInstance() {
        if (!ChatEmitter.instance) {
            ChatEmitter.instance = new ChatEmitter();
        }
        return ChatEmitter.instance;
    }
    init(io) {
        this.io = io;
        logger_1.default.info('[ChatEmitter] Initialized with Socket.IO server.');
    }
    // Broadcast new message to everyone in the chat room
    sendMessageUser(chatId, vendorId, payload) {
        if (!this.io) {
            logger_1.default.warn('[ChatEmitter] io not initialized. Skipping emit.');
            return;
        }
        const room = socket_types_1.SocketRooms.forChat(chatId);
        const vendorRoom = socket_types_1.SocketRooms.forUser(vendorId);
        logger_1.default.info(`[ChatEmitter] Emitting '${socket_event_1.CHAT_EVENTS.MESSAGE_NEW}' → room: "${room}"`);
        this.io.to(room).emit(socket_event_1.CHAT_EVENTS.MESSAGE_NEW, payload);
        this.io.to(vendorRoom).emit(socket_event_1.CHAT_EVENTS.MESSAGE_NEW, payload);
    }
    sendMessageVendor(chatId, payload) {
        if (!this.io) {
            logger_1.default.warn('[ChatEmitter] io not initialized. Skipping emit.');
            return;
        }
        const room = socket_types_1.SocketRooms.forChat(chatId);
        logger_1.default.info(`[ChatEmitter] Emitting '${socket_event_1.CHAT_EVENTS.MESSAGE_NEW}' → room: "${room}"`);
        this.io.to(room).emit(socket_event_1.CHAT_EVENTS.MESSAGE_NEW, payload);
    }
    // Broadcast room update (pin / archive) to everyone in the chat room
    sendRoomUpdated(chatId, payload) {
        if (!this.io)
            return;
        const room = socket_types_1.SocketRooms.forChat(chatId);
        logger_1.default.info(`[ChatEmitter] Emitting '${socket_event_1.CHAT_EVENTS.ROOM_UPDATED}' → room: "${room}"`);
        this.io.to(room).emit(socket_event_1.CHAT_EVENTS.ROOM_UPDATED, payload);
    }
    isReady() {
        return this.io !== null;
    }
}
exports.ChatEmitter = ChatEmitter;
exports.chatEmitter = ChatEmitter.getInstance();
