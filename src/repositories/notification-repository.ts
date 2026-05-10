import { injectable, inject } from "tsyringe";
import { INotificationRepository } from "../interfaces/repository_interfaces/INotificationRepository";
import { BaseRepository } from "./base.repository";
import { INotification } from "../types/entities/notification.entity";
import { NotificationModel } from "../models/notification.model";

@injectable()
export class NotificationRepository extends BaseRepository<INotification> implements INotificationRepository {
    
    constructor(){
        super(NotificationModel)
    }
}