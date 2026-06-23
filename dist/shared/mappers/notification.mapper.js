"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationMapper = void 0;
class NotificationMapper {
    static toNotification(notification) {
        return {
            _id: notification._id.toString(),
            recipientId: notification.recipientId.toString(),
            recipientRole: notification.recipientRole,
            senderId: notification.senderId ? notification.senderId.toString() : null,
            notificationType: notification.notificationType,
            title: notification.title,
            message: notification.message,
            data: notification.data,
            redirectUrl: notification.redirectUrl || null,
            isRead: notification.isRead,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt,
        };
    }
}
exports.NotificationMapper = NotificationMapper;
