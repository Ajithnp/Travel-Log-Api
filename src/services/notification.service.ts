import { inject, injectable } from "tsyringe";
import { CreateNotificationDTO, INotificationService, NotificationResponseDTO, PaginatedNotificationsDTO } from "../interfaces/service_interfaces/INotificationService";
import { GetNotificationsQuery, INotificationRepository } from "../interfaces/repository_interfaces/INotificationRepository";
import { toObjectId } from "../shared/utils/database/objectId.helper";
import { NotificationMapper } from "../shared/mappers/notification.mapper";
import { UserRole } from "types/entities/user.entity";

@injectable()
export class NotificationService implements INotificationService {

    constructor(
    @inject('INotificationRepository')
    private _notificationRepo: INotificationRepository,
    ){}

    async createNotification(payload: CreateNotificationDTO): Promise<NotificationResponseDTO> {
         const notification = await this._notificationRepo.create({
            recipientId: toObjectId(payload.recipientId as string),
            recipientRole: payload.recipientRole,
            senderId: payload.senderId ? toObjectId(payload.senderId as string) : undefined,
            notificationType: payload.notificationType,
            title: payload.title,
            message: payload.message,
            data: payload.data,
            redirectUrl: payload.redirectUrl,
         })

         return NotificationMapper.toNotification(notification);
    };

    async getUserNotifications(query: GetNotificationsQuery): Promise<PaginatedNotificationsDTO> {

        
        const { notifications, total, unreadCount } = await this._notificationRepo.findAllNotificationsByUserId({ ...query});

        const totalPages = Math.ceil(total / query.limit);

        return {
            notifications: notifications.map(NotificationMapper.toNotification),
            total,
            unreadCount,
            page:query.page,
            limit:query.limit,
            totalPages,
        };
    };

    async getUnreadCount(payload:{recipientId:string,recipientRole:UserRole}): Promise<{ unreadCount: number }> {

        const count = await this._notificationRepo.getUnreadCount(payload);

        return {unreadCount: count};


    };
}