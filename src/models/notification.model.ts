import { model, Schema } from "mongoose";
import { ALL_NOTIFICATION_TYPES, INotification } from "../types/entities/notification.entity";


const NotificationSchema = new Schema<INotification>(
  {
    receipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receipientRole: {
      type: String,
      enum: ["user","admin","vendor"],
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    notificationType: {
      type: String,
      enum: ALL_NOTIFICATION_TYPES,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    redirectUrl: {
      type: String,
      default: null,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ recipientId: 1, recipientRole: 1 });

NotificationSchema.index({ createdAt: -1 });

export const NotificationModel = model<INotification>(
  "Notification",
  NotificationSchema
);