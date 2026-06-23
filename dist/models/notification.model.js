"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModel = void 0;
const mongoose_1 = require("mongoose");
const notification_entity_1 = require("../types/entities/notification.entity");
const NotificationSchema = new mongoose_1.Schema({
    recipientId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    recipientRole: {
        type: String,
        enum: ['user', 'admin', 'vendor'],
        required: true,
    },
    senderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    notificationType: {
        type: String,
        enum: notification_entity_1.ALL_NOTIFICATION_TYPES,
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
        type: mongoose_1.Schema.Types.Mixed,
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
}, {
    timestamps: true,
});
NotificationSchema.index({ recipientId: 1, recipientRole: 1 });
NotificationSchema.index({ createdAt: -1 });
exports.NotificationModel = (0, mongoose_1.model)('Notification', NotificationSchema);
