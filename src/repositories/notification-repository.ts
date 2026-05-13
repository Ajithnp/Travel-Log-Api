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
        const { recipientId, recipientRole, isRead, page , limit} = query;

        const filter: FilterQuery<INotification> = {
            recipientId: new Types.ObjectId(recipientId),
            recipientRole,
        };
       
        if (isRead !== undefined) filter.isRead = isRead;

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

  async markAllRead(query: {
    recipientId: string,
    recipientRole: UserRole
  }): Promise<number> {
    const result = await this.model.updateMany(
      {
        recipientId: new Types.ObjectId(query.recipientId),
        recipientRole: query.recipientRole,
        isRead: false,
      },
      { $set: { isRead: true } }
    );
    return result.modifiedCount;
  }

  async markAsRead(notificationId: string, recipientId: string, recipientRole: UserRole): Promise<{ modifiedCount: number }> {
    const result = await this.model.updateOne(
      {
        _id: new Types.ObjectId(notificationId),
        recipientId: new Types.ObjectId(recipientId),
        recipientRole,
        isRead: false,
      },
      { $set: { isRead: true } }
    );
    return result;
  }
}