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
exports.registerNotificationHandlers = registerNotificationHandlers;
const socket_types_1 = require("../types/socket.types");
const logger_1 = __importDefault(require("../../../config/logger"));
const notification_emitter_1 = require("../namespaces/notification-emitter");
const socket_event_1 = require("../types/socket.event");
function registerNotificationHandlers(io, socket, notificationRepository, userRepository) {
    const { userId, role } = socket.data;
    // ── 1. Join rooms
    const privateRoom = socket_types_1.SocketRooms.forUser(userId);
    const roleRoom = socket_types_1.SocketRooms.forRole(role);
    socket.join(privateRoom);
    socket.join(roleRoom);
    logger_1.default.info(`[Socket] Connected: userId=${userId} role=${role} | ` +
        `rooms: [${privateRoom}, ${roleRoom}, | ` +
        `socketId=${socket.id}`);
    // Send current unread count on connect(when connection establishes)
    notificationRepository
        .getUnreadCount({ recipientId: userId, recipientRole: role })
        .then((count) => {
        socket.emit(socket_event_1.NOTIFICATION_EVENTS.UNREAD_COUNT, { count });
    })
        .catch((err) => {
        console.error(`[Socket] Failed to fetch unread count for ${userId}:`, err);
    });
    socket.on(socket_event_1.NOTIFICATION_EVENTS.MARK_READ, ({ notificationId }) => {
        notification_emitter_1.notificationEmitter.sendReadSync(userId, notificationId);
    });
    //Unread
    userRepository
        .getUserUnreadTabs(userId)
        .then((tabs) => {
        socket.emit(socket_event_1.NOTIFICATION_EVENTS.TAB_READ, { tabs });
    })
        .catch((err) => {
        logger_1.default.error(`[Socket] tab_read error for ${userId}:`, err);
    });
    // Client event: request fresh unread count
    socket.on(socket_event_1.NOTIFICATION_EVENTS.REQUEST_COUNT, () => __awaiter(this, void 0, void 0, function* () {
        try {
            const count = yield notificationRepository.getUnreadCount({
                recipientId: userId,
                recipientRole: role,
            });
            socket.emit(socket_event_1.NOTIFICATION_EVENTS.UNREAD_COUNT, { count });
        }
        catch (err) {
            console.error(`[Socket] request_count error for ${userId}:`, err);
        }
    }));
    // Disconnect cleanup
    socket.on('disconnect', (reason) => {
        console.log(`[Socket] Disconnected: userId=${userId} socketId=${socket.id} reason=${reason}`);
    });
    //. Handle unexpected errors on this socket
    socket.on('error', (err) => {
        console.error(`[Socket] Socket error for userId=${userId}:`, err.message);
    });
}
