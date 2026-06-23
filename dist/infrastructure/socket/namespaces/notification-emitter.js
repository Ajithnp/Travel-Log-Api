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
exports.notificationEmitter = exports.NotificationEmitter = void 0;
const logger_1 = __importDefault(require("../../../config/logger"));
const socket_types_1 = require("../types/socket.types");
const socket_event_1 = require("../types/socket.event");
class NotificationEmitter {
    constructor() {
        this.io = null;
    }
    static getInstance() {
        if (!NotificationEmitter.instance) {
            NotificationEmitter.instance = new NotificationEmitter();
        }
        return NotificationEmitter.instance;
    }
    init(io) {
        this.io = io;
        logger_1.default.info('[NotificationEmitter] Initialized with Socket.IO server.');
    }
    send(target, payload) {
        if (!this.io) {
            // Socket not yet initialized (e.g. during unit tests or early startup)
            console.warn('[NotificationEmitter] io not initialized. Skipping emit.');
            return;
        }
        const room = this.resolveRoom(target);
        logger_1.default.info(`[NotificationEmitter] Emitting 'notification:new' → room: "${room}" | type: ${payload.notificationType}`);
        this.io.to(room).emit('notification_new', payload);
    }
    setUnreadTabs(userId, tab) {
        if (!this.io)
            return;
        this.io.to(socket_types_1.SocketRooms.forUser(userId)).emit(socket_event_1.NOTIFICATION_EVENTS.TAB_NEW, { tab });
    }
    // ── Emit unread count update to a specific user
    sendUnreadCount(userId, count) {
        if (!this.io)
            return;
        this.io.to(socket_types_1.SocketRooms.forUser(userId)).emit('notification_unread_count', { count });
    }
    // ── Emit read sync (for multi-tab support)
    sendReadSync(userId, notificationId) {
        if (!this.io)
            return;
        this.io.to(socket_types_1.SocketRooms.forUser(userId)).emit('notification_read', { notificationId });
    }
    // ── Emit mark-all-read sync
    sendReadAllSync(userId) {
        if (!this.io)
            return;
        this.io.to(socket_types_1.SocketRooms.forUser(userId)).emit('notification_read_all');
    }
    resolveRoom(target) {
        switch (target.type) {
            case 'user':
                return socket_types_1.SocketRooms.forUser(target.userId);
            case 'role':
                return socket_types_1.SocketRooms.forRole(target.role);
        }
    }
    isReady() {
        return this.io !== null;
    }
    /*
     * Get count of sockets currently in a user's private room.
     */
    getSocketCountForUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.io)
                return 0;
            const sockets = yield this.io.in(socket_types_1.SocketRooms.forUser(userId)).fetchSockets();
            return sockets.length;
        });
    }
    isUserOnline(userId) {
        return this.getSocketCountForUser(userId).then((count) => count > 0);
    }
}
exports.NotificationEmitter = NotificationEmitter;
exports.notificationEmitter = NotificationEmitter.getInstance();
