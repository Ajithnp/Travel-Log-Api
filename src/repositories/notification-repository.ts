import { injectable, inject } from "tsyringe";
import { GetNotificationsQuery, INotificationRepository } from "../interfaces/repository_interfaces/INotificationRepository";
import { BaseRepository } from "./base.repository";
import { INotification, NotificationListResult } from "../types/entities/notification.entity";
import { NotificationModel } from "../models/notification.model";
import { FilterQuery, Types } from "mongoose";
import { UserRole } from "types/entities/user.entity";

@injectable()
export class NotificationRepository extends BaseRepository<INotification> implements INotificationRepository {
    
    constructor(){
        super(NotificationModel)
    }

    async findAllNotificationsByUserId(query: GetNotificationsQuery): Promise<NotificationListResult> {
        const { recipientId, recipientRole, notificationType, page , limit} = query;

        const filter: FilterQuery<INotification> = {
            recipientId: new Types.ObjectId(recipientId),
            recipientRole,
        };

        if (notificationType) {
            filter.notificationType = notificationType;
        }

    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      this.model.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<INotification[]>(),
 
      this.model.countDocuments(filter),
 
      this.model.countDocuments({
        recipientId:   new Types.ObjectId(recipientId),
        recipientRole: recipientRole,
        isRead:        false,
      }),
    ]);
    return { notifications, total, unreadCount };

   }  
   
    async getUnreadCount(query: {
    recipientId: string,
    recipientRole: UserRole
  }): Promise<number> {
    const count = await this.model.countDocuments({
      recipientId: new Types.ObjectId(query.recipientId),
      recipientRole:query.recipientRole,
      isRead: false,
    });
    return count;
  }
}