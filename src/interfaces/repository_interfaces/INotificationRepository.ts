import type { INotification } from "../../types/entities/notification.entity";
import { IBaseRepository } from "./IBaseRepository";

export interface INotificationRepository extends IBaseRepository<INotification> {
    
}