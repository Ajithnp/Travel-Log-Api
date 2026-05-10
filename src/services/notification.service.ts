import { inject, injectable } from "tsyringe";
import { CreateNotificationDTO, INotificationService, NotificationResponseDTO } from "../interfaces/service_interfaces/INotificationService";
import { INotificationRepository } from "../interfaces/repository_interfaces/INotificationRepository";
import { toObjectId } from "../shared/utils/database/objectId.helper";
import { NotificationMapper } from "../shared/mappers/notification.mapper";

@injectable()
export class NotificationService implements INotificationService {

    constructor(
    @inject('INotificationRepository')
    private _notificationRepo: INotificationRepository,
    ){}

    async createNotification(payload: CreateNotificationDTO): Promise<NotificationResponseDTO> {
         const notification = await this._notificationRepo.create({
            receipientId: toObjectId(payload.recipientId as string),
            receipientRole: payload.recipientRole,
            senderId: payload.senderId ? toObjectId(payload.senderId as string) : undefined,
            notificationType: payload.notificationType,
            title: payload.title,
            message: payload.message,
            data: payload.data,
            redirectUrl: payload.redirectUrl,
         })

         return NotificationMapper.toNotification(notification)
    }

    // async getUserNotification(): Promise<void> {
    //      const notification = await this._notificationRepo.create(payload)
    // }
    
}