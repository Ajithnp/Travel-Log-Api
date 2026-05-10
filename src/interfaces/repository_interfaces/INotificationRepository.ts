import { UserRole } from "types/entities/user.entity";
import type { INotification, NotificationListResult, NotificationType } from "../../types/entities/notification.entity";
import { IBaseRepository } from "./IBaseRepository";

export interface INotificationRepository extends IBaseRepository<INotification> {
    findAllNotificationsByUserId(query: GetNotificationsQuery): Promise<NotificationListResult>;
}

export interface GetNotificationsQuery {
    recipientId: string;
    recipientRole: UserRole;
    notificationType?: NotificationType;
    page: number;                         
    limit: number;                      
}