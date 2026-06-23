"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const tsyringe_1 = require("tsyringe");
const base_repository_1 = require("./base.repository");
const notification_model_1 = require("../models/notification.model");
const mongoose_1 = require("mongoose");
let NotificationRepository = class NotificationRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(notification_model_1.NotificationModel);
    }
    findAllNotificationsByUserId(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { recipientId, recipientRole, isRead, page, limit } = query;
            const filter = {
                recipientId: new mongoose_1.Types.ObjectId(recipientId),
                recipientRole,
            };
            if (isRead !== undefined)
                filter.isRead = isRead;
            const skip = (page - 1) * limit;
            const [notifications, total, unreadCount] = yield Promise.all([
                this.model
                    .find(filter)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                this.model.countDocuments(filter),
                this.model.countDocuments({
                    recipientId: new mongoose_1.Types.ObjectId(recipientId),
                    recipientRole: recipientRole,
                    isRead: false,
                }),
            ]);
            return { notifications, total, unreadCount };
        });
    }
    getUnreadCount(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield this.model.countDocuments({
                recipientId: new mongoose_1.Types.ObjectId(query.recipientId),
                recipientRole: query.recipientRole,
                isRead: false,
            });
            return count;
        });
    }
    markAllRead(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.model.updateMany({
                recipientId: new mongoose_1.Types.ObjectId(query.recipientId),
                recipientRole: query.recipientRole,
                isRead: false,
            }, { $set: { isRead: true } });
            return result.modifiedCount;
        });
    }
    markAsRead(notificationId, recipientId, recipientRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.model.updateOne({
                _id: new mongoose_1.Types.ObjectId(notificationId),
                recipientId: new mongoose_1.Types.ObjectId(recipientId),
                recipientRole,
                isRead: false,
            }, { $set: { isRead: true } });
            return result;
        });
    }
};
exports.NotificationRepository = NotificationRepository;
exports.NotificationRepository = NotificationRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], NotificationRepository);
