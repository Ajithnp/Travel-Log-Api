import { UserRole } from "types/entities/user.entity";
import type { INotification, NotificationListResult, NotificationType } from "../../types/entities/notification.entity";
import { IBaseRepository } from "./IBaseRepository";

export interface INotificationRepository extends IBaseRepository<INotification> {
    findAllNotificationsByUserId(query: GetNotificationsQuery): Promise<NotificationListResult>;
    getUnreadCount(query:{recipientId: string, recipientRole: UserRole}): Promise<number>
    markAllRead(query: {recipientId: string,recipientRole: UserRole}): Promise<number>
    markAsRead(notificationId: string, recipientId: string, recipientRole: UserRole): Promise<{ modifiedCount: number }>;
}

export interface GetNotificationsQuery {
    recipientId: string;
    recipientRole: UserRole;
    notificationType?: NotificationType;
    page: number;                         
    limit: number;                      
}