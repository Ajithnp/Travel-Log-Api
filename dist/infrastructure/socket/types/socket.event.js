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
    JOIN_ROOM: 'chat:join',
    LEAVE_ROOM: 'chat:leave',
    SEND_NEW_VENDOR_MESSAGE: 'chat:send_new_vendor_message',
    SEND_NEW_USER_MESSAGE: 'chat:send_new_user_message',
    // Server → Client
    MESSAGE_NEW: 'chat:message_new',
    ROOM_UPDATED: 'chat:room_updated',
    CHAT_ERROR: 'chat:error',
};
