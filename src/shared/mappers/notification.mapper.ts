import { NotificationResponseDTO } from "../../interfaces/service_interfaces/INotificationService";
import { INotification } from "../../types/entities/notification.entity";


export class NotificationMapper {

    static toNotification(notification: INotification): NotificationResponseDTO {
        return {
            _id: notification._id.toString(),
            recipientId: notification.receipientId.toString(),
            recipientRole: notification.receipientRole,
            senderId: notification.senderId ? notification.senderId.toString() : null,
            notificationType: notification.notificationType,
            title: notification.title,
            message: notification.message,
            data: notification.data,
            redirectUrl: notification.redirectUrl || null,
            isRead: notification.isRead,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt
        }
    }

    
}