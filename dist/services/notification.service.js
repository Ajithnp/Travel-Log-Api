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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const tsyringe_1 = require("tsyringe");
const objectId_helper_1 = require("../shared/utils/database/objectId.helper");
const notification_mapper_1 = require("../shared/mappers/notification.mapper");
const notification_emitter_1 = require("../infrastructure/socket/namespaces/notification-emitter");
const logger_1 = __importDefault(require("../config/logger"));
const http_status_code_1 = require("../shared/constants/http_status_code");
const AppError_1 = require("../errors/AppError");
const messages_1 = require("../shared/constants/messages");
let NotificationService = class NotificationService {
    constructor(_notificationRepo, _userRepository) {
        this._notificationRepo = _notificationRepo;
        this._userRepository = _userRepository;
    }
    createNotification(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const notification = yield this._notificationRepo.create({
                recipientId: (0, objectId_helper_1.toObjectId)(payload.recipientId),
                recipientRole: payload.recipientRole,
                senderId: payload.senderId ? (0, objectId_helper_1.toObjectId)(payload.senderId) : undefined,
                notificationType: payload.notificationType,
                title: payload.title,
                message: payload.message,
                data: payload.data,
                redirectUrl: payload.redirectUrl,
            });
            const response = notification_mapper_1.NotificationMapper.toNotification(notification);
            const target = payload.recipientId
                ? { type: 'user', userId: payload.recipientId.toString() }
                : { type: 'role', role: payload.recipientRole };
            // . Emit via socket (fire-and-forget, never throws)
            try {
                notification_emitter_1.notificationEmitter.send(target, {
                    _id: response._id,
                    recipientId: response.recipientId,
                    recipientRole: response.recipientRole,
                    notificationType: response.notificationType,
                    title: response.title,
                    message: response.message,
                    data: response.data,
                    redirectUrl: response.redirectUrl,
                    isRead: response.isRead,
                    createdAt: response.createdAt,
                });
            }
            catch (err) {
                logger_1.default.error('[NotificationService] Socket emit failed (non-fatal):', err);
            }
            return response;
        });
    }
    getUserNotifications(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { notifications, total, unreadCount } = yield this._notificationRepo.findAllNotificationsByUserId(Object.assign({}, query));
            const totalPages = Math.ceil(total / query.limit);
            return {
                notifications: notifications.map(notification_mapper_1.NotificationMapper.toNotification),
                total,
                unreadCount,
                page: query.page,
                limit: query.limit,
                totalPages,
            };
        });
    }
    getUnreadCount(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield this._notificationRepo.getUnreadCount(payload);
            return { unreadCount: count };
        });
    }
    markAllRead(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield this._notificationRepo.markAllRead(payload);
            notification_emitter_1.notificationEmitter.sendReadAllSync(payload.recipientId);
            notification_emitter_1.notificationEmitter.sendUnreadCount(payload.recipientId, 0);
            return { modifiedCount: count };
        });
    }
    markAsRead(notificationId, recipientId, recipientRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._notificationRepo.markAsRead(notificationId, recipientId, recipientRole);
            notification_emitter_1.notificationEmitter.sendReadSync(recipientId, notificationId);
            const count = yield this._notificationRepo.getUnreadCount({ recipientId, recipientRole });
            notification_emitter_1.notificationEmitter.sendUnreadCount(recipientId, count);
            return { modifiedCount: result.modifiedCount };
        });
    }
    deleteNotification(notificationId, recipientId, recipientRole) {
        return __awaiter(this, void 0, void 0, function* () {
            notification_emitter_1.notificationEmitter.sendReadSync(recipientId, notificationId);
            yield this._notificationRepo.findOneAndDelete({
                _id: (0, objectId_helper_1.toObjectId)(notificationId),
                recipientId: (0, objectId_helper_1.toObjectId)(recipientId),
                recipientRole: recipientRole,
            });
            notification_emitter_1.notificationEmitter.sendUnreadCount(recipientId, 1);
        });
    }
    markTabsAsRead(userId, tab) {
        return __awaiter(this, void 0, void 0, function* () {
            const userDoc = yield this._userRepository.findById(userId);
            if (!userDoc) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.USER_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            yield this._userRepository.findByIdAndRemoveUnreadTabs(userId, tab);
        });
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('INotificationRepository')),
    __param(1, (0, tsyringe_1.inject)('IUserRepository')),
    __metadata("design:paramtypes", [Object, Object])
], NotificationService);
