"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketRooms = void 0;
// ─── Socket Rooms
//   user:<userId>          → private room for one specific user/vendor/admin
//   role:User              → broadcast room for ALL users
//   role:Vendor            → broadcast room for ALL vendors
exports.SocketRooms = {
    forUser: (userId) => `user:${userId}`,
    forRole: (role) => `role:${role}`,
    forChat: (chatId) => `chat:${chatId}`,
};
