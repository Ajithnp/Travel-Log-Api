import { inject, injectable } from "tsyringe";
import { createBroadcastNotification, CreateNotificationDTO, INotificationService, NotificationResponseDTO, PaginatedNotificationsDTO } from "../interfaces/service_interfaces/INotificationService";
import { GetNotificationsQuery, INotificationRepository } from "../interfaces/repository_interfaces/INotificationRepository";
import { toObjectId } from "../shared/utils/database/objectId.helper";
import { NotificationMapper } from "../shared/mappers/notification.mapper";
import { UserRole } from "../types/entities/user.entity";


// is fire-and-forget intentionally:
//   - If the user is offline, the socket emit does nothing (no room member).
//   - The notification is already in the DB, so they'll see it on next load.
//   - We never want a socket failure to break the HTTP response.

import { EmitTarget } from "../infrastructure/socket/types/socket.types";
import { notificationEmitter } from "../infrastructure/socket/namespaces/notification-emitter";
import logger from "../config/logger";


@injectable()
export class NotificationService implements INotificationService {

    constructor(
    @inject('INotificationRepository')
    private _notificationRepo: INotificationRepository,
    ){}
   
    async createNotification(payload: CreateNotificationDTO): Promise<NotificationResponseDTO> {

        // ── 1. Persist to DB 
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

         const response = NotificationMapper.toNotification(notification);
        // ── 2. Resolve emit target 

        // recipientId present → send to that specific user's private room
        // recipientRole only  → send to everyone in that role
        // (broadcast use case is handled by createBroadcastNotification below)

      const target: EmitTarget = payload.recipientId
      ? { type: "user", userId: payload.recipientId.toString() }
      : { type: "role", role: payload.recipientRole };
       
      // ── 3. Emit via socket (fire-and-forget, never throws)
      
      try {
        notificationEmitter.send(target, {
        _id:              response._id,
        recipientId:      response.recipientId,
        recipientRole:    response.recipientRole,
        notificationType: response.notificationType,
        title:            response.title,
        message:          response.message,
        data:             response.data,
        redirectUrl:      response.redirectUrl,
        isRead:           response.isRead,
        createdAt:        response.createdAt,
      });
    } catch (err) {
      logger.error("[NotificationService] Socket emit failed (non-fatal):", err);
    }
 
    return response;
        
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

     // ── After mark-all-read: zero out the badge on all tabs 
    
    async markAllRead(payload:{recipientId:string,recipientRole:UserRole}): Promise<{ modifiedCount: number }> {
        const count = await this._notificationRepo.markAllRead(payload);

        notificationEmitter.sendReadAllSync(payload.recipientId);
        notificationEmitter.sendUnreadCount(payload.recipientId, 0);
        
        return {modifiedCount: count};
    }

    //  After mark-as-read: push count update + sync other tabs 
    async markAsRead(notificationId:string, recipientId:string, recipientRole:UserRole): Promise<{ modifiedCount: number }> {
        const result = await this._notificationRepo.markAsRead(notificationId, recipientId, recipientRole);

        // Sync other open tabs of the same user
    notificationEmitter.sendReadSync(recipientId, notificationId);


    const count = await this._notificationRepo.getUnreadCount({recipientId,recipientRole});
    
    notificationEmitter.sendUnreadCount(recipientId, count);
    
    return {modifiedCount: result.modifiedCount};
    }

    async deleteNotification(notificationId:string, recipientId:string, recipientRole:UserRole): Promise<void> {
         notificationEmitter.sendReadSync(recipientId, notificationId);
         await this._notificationRepo.findOneAndDelete({_id:toObjectId(notificationId), recipientId:toObjectId(recipientId), recipientRole:recipientRole });
        
        notificationEmitter.sendUnreadCount(recipientId, 1);
    }
}