"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHAT_EVENTS = exports.NOTIFICATION_EVENTS = exports.CONNECTION_EVENTS = void 0;
exports.CONNECTION_EVENTS = {
    CONNECT: 'connection',
    DISCONNECT: 'disconnect',
    ERROR: 'error',
};
exports.NOTIFICATION_EVENTS = {
    SEND: 'notification_send',
    NEW: 'notification_new',
    RECEIVE: 'notification_receive',
    MARK_READ: 'notification_mark_read',
    MARK_ALL_READ: 'notification_mark_all_read',
    DELETE: 'notification_delete',
    USER_NOTIFICATIONS: 'notification_user_list',
    UNREAD_COUNT: 'notification_unread_count',
    REQUEST_COUNT: 'notification_request_count',
    READ_SYNC: 'notification_read_sync',
    TAB_READ: 'tab_read',
    TAB_NEW: 'tab_new',
};
exports.CHAT_EVENTS = {
    // Client → Server
    JOIN_ROOM: 'chat:join', // user/vendor joins a chat room
    LEAVE_ROOM: 'chat:leave', // user/vendor leaves a chat room
    // Server → Client
    MESSAGE_NEW: 'chat:message_new', // new message broadcast to room
    ROOM_UPDATED: 'chat:room_updated', // pinned msg / archive update
};
