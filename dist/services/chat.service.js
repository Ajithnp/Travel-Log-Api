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
exports.ChatService = void 0;
const tsyringe_1 = require("tsyringe");
const roles_1 = require("../shared/constants/roles");
const chat_mapper_1 = require("../shared/mappers/chat.mapper");
const chat_emitter_1 = require("../infrastructure/socket/namespaces/chat-emitter");
const logger_1 = __importDefault(require("../config/logger"));
const http_status_code_1 = require("../shared/constants/http_status_code");
const messages_1 = require("../shared/constants/messages");
const AppError_1 = require("../errors/AppError");
const objectId_helper_1 = require("../shared/utils/database/objectId.helper");
const notification_emitter_1 = require("../infrastructure/socket/namespaces/notification-emitter");
const constants_1 = require("../shared/constants/constants");
let ChatService = class ChatService {
    constructor(_chatRepo, _messageRepo, _userRepo) {
        this._chatRepo = _chatRepo;
        this._messageRepo = _messageRepo;
        this._userRepo = _userRepo;
    }
    ensureRoomExists(chatName, scheduleId, packageId, vendorId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield this._chatRepo.findChatRoomByScheduleId(scheduleId);
            if (!existing) {
                const chatRoom = yield this._chatRepo.createRoom({
                    chatName,
                    scheduleId,
                    packageId,
                    vendorId,
                    userId,
                });
                return { chatId: chatRoom._id.toString() };
            }
            const isMember = yield this._chatRepo.isMember(existing._id.toString(), userId.toString());
            if (!isMember) {
                yield this._chatRepo.addMember(existing._id.toString(), userId.toString());
            }
            return { chatId: existing._id.toString() };
        });
    }
    getUserChat(chatId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const room = yield this._chatRepo.findRoomByMemberId(chatId, userId);
            if (!room)
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.CHAT_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            const lastMessage = yield this._messageRepo.getLastMessage(room._id.toString());
            const response = chat_mapper_1.ChatMapper.toChatRoomWithPreviewDTO(room, lastMessage);
            return response;
        });
    }
    getUserChatMessages(chatId, userId, cursor, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const isMember = yield this._chatRepo.isMember(chatId.toString(), userId.toString());
            if (!isMember)
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.FORBIDDEN_ACCESS, http_status_code_1.HTTP_STATUS.FORBIDDEN);
            const result = yield this._messageRepo.findMessagesByChatId(chatId.toString(), cursor, limit);
            return {
                messages: result.messages.map(chat_mapper_1.ChatMapper.toMessageDTO),
                hasMore: result.hasMore,
                nextCursor: result.nextCursor,
            };
        });
    }
    sendUserMessage(chatId, userId, senderName, content) {
        return __awaiter(this, void 0, void 0, function* () {
            const isMember = yield this._chatRepo.isActiveMember(chatId.toString(), userId.toString());
            if (!isMember)
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.FORBIDDEN_ACCESS, http_status_code_1.HTTP_STATUS.FORBIDDEN);
            const room = yield this._chatRepo.findRoomById(chatId.toString());
            if (!room)
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.CHAT_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            if (room.status === 'archived')
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.CHAT_ARCHIVED, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            const message = yield this._messageRepo.createTextMessage({
                chatId: chatId.toString(),
                senderId: userId.toString(),
                senderRole: roles_1.USER_ROLES.USER,
                senderName,
                content,
            });
            yield this._userRepo.findByIdAndAddUnreadTabs(room.vendorId.toString(), constants_1.VENDOR_TABS.CHAT);
            try {
                notification_emitter_1.notificationEmitter.setUnreadTabs(room.vendorId.toString(), constants_1.VENDOR_TABS.CHAT);
                chat_emitter_1.chatEmitter.sendMessageUser(chatId.toString(), room.vendorId.toString(), {
                    id: message._id.toString(),
                    chatId: chatId.toString(),
                    senderId: userId.toString(),
                    senderRole: roles_1.USER_ROLES.USER,
                    senderName,
                    content: message.content,
                    createdAt: message.createdAt,
                });
            }
            catch (err) {
                logger_1.default.error('[ChatService] Socket emit failed (non-fatal):', err);
            }
            return chat_mapper_1.ChatMapper.toMessageDTO(message);
        });
    }
    // ─── Vendor chat endpoints
    getVendorChats(vendorId, status, search) {
        return __awaiter(this, void 0, void 0, function* () {
            const rooms = yield this._chatRepo.findRoomsByVendorId(vendorId, status, search);
            return Promise.all(rooms.map((room) => __awaiter(this, void 0, void 0, function* () {
                const lastMessage = yield this._messageRepo.getLastMessage(room._id.toString());
                const lastReadAt = room.vendorLastReadAt || new Date(0);
                const unreadCount = yield this._messageRepo.getMessageUnreadCount(room._id.toString(), roles_1.USER_ROLES.USER, lastReadAt);
                const dto = chat_mapper_1.ChatMapper.toChatRoomWithPreviewDTO(room, lastMessage);
                return Object.assign(Object.assign({}, dto), { unreadCount });
            })));
        });
    }
    getVendorChatMessages(chatId, vendorId, cursor, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const room = yield this._chatRepo.findRoomById(chatId);
            if (!room)
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.CHAT_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            if (room.vendorId.toString() !== vendorId)
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.FORBIDDEN_ACCESS, http_status_code_1.HTTP_STATUS.FORBIDDEN);
            const result = yield this._messageRepo.findMessagesByChatId(chatId, cursor, limit);
            return {
                messages: result.messages.map(chat_mapper_1.ChatMapper.toMessageDTO),
                hasMore: result.hasMore,
                nextCursor: result.nextCursor,
            };
        });
    }
    sendVendorMessage(chatId, vendorId, senderName, content) {
        return __awaiter(this, void 0, void 0, function* () {
            const room = yield this._chatRepo.findRoomById(chatId);
            if (!room)
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.CHAT_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            if (room.vendorId.toString() !== vendorId)
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.FORBIDDEN_ACCESS, http_status_code_1.HTTP_STATUS.FORBIDDEN);
            if (room.status === 'archived')
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.CHAT_ARCHIVED, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            if (!content || content.trim() === '')
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.CONTENT_REQUIRED, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            const message = yield this._messageRepo.createTextMessage({
                chatId,
                senderId: vendorId,
                senderRole: roles_1.USER_ROLES.VENDOR,
                senderName,
                content: content.trim(),
            });
            try {
                chat_emitter_1.chatEmitter.sendMessageVendor(chatId, {
                    id: message._id.toString(),
                    chatId,
                    senderId: vendorId,
                    senderRole: roles_1.USER_ROLES.VENDOR,
                    senderName,
                    content: message.content,
                    createdAt: message.createdAt,
                });
            }
            catch (err) {
                logger_1.default.error('[ChatService] Socket emit failed (non-fatal):', err);
            }
            return chat_mapper_1.ChatMapper.toMessageDTO(message);
        });
    }
    pinMessage(chatId, vendorId, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const room = yield this._chatRepo.findRoomById(chatId);
            if (!room)
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.CHAT_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            if (room.vendorId.toString() !== vendorId)
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.FORBIDDEN_ACCESS, http_status_code_1.HTTP_STATUS.FORBIDDEN);
            const updated = yield this._chatRepo.pinMessage(chatId, message);
            if (updated) {
                try {
                    chat_emitter_1.chatEmitter.sendRoomUpdated(chatId, {
                        chatId,
                        pinnedMessage: message,
                    });
                }
                catch (err) {
                    logger_1.default.error('[ChatService] Socket emit failed (non-fatal):', err);
                }
            }
            return updated ? chat_mapper_1.ChatMapper.toChatRoomDTO(updated) : null;
        });
    }
    removeMember(chatId, vendorId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const room = yield this._chatRepo.findRoomById(chatId);
            if (!room)
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.CHAT_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            if (room.vendorId.toString() !== vendorId)
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.FORBIDDEN_ACCESS, http_status_code_1.HTTP_STATUS.FORBIDDEN);
            const member = room.members.find((m) => m.userId.toString() === userId);
            if (!member)
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.USER_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            const updated = yield this._chatRepo.deactivateMember(chatId, userId);
            if (updated) {
                try {
                    chat_emitter_1.chatEmitter.sendRoomUpdated(chatId, {
                        chatId,
                        blockedUserId: userId,
                    });
                }
                catch (err) {
                    logger_1.default.error('[ChatService] Socket emit failed (non-fatal):', err);
                }
            }
            return updated ? chat_mapper_1.ChatMapper.toChatRoomDTO(updated) : null;
        });
    }
    archiveRoom(chatId, vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const room = yield this._chatRepo.findRoomById(chatId);
            if (!room)
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.CHAT_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            if (room.vendorId.toString() !== vendorId)
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.FORBIDDEN_ACCESS, http_status_code_1.HTTP_STATUS.FORBIDDEN);
            if (room.status === 'archived')
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.CHAT_ARCHIVED, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            const updated = yield this._chatRepo.archiveRoom(chatId);
            if (updated) {
                try {
                    chat_emitter_1.chatEmitter.sendRoomUpdated(chatId, {
                        chatId,
                        status: 'archived',
                    });
                }
                catch (err) {
                    logger_1.default.error('[ChatService] Socket emit failed (non-fatal):', err);
                }
            }
            return updated ? chat_mapper_1.ChatMapper.toChatRoomDTO(updated) : null;
        });
    }
    getChatMembers(chatId, vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const room = yield this._chatRepo.getRoomWithMembers(chatId);
            if (!room)
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.CHAT_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            if (room.vendorId.toString() !== vendorId)
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.FORBIDDEN_ACCESS, http_status_code_1.HTTP_STATUS.FORBIDDEN);
            return chat_mapper_1.ChatMapper.toChatMemberDetailDTOList(room);
        });
    }
    markChatAsReadForVendor(chatId, vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const room = yield this._chatRepo.findRoomById(chatId);
            if (!room)
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.CHAT_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            if (room.vendorId.toString() !== vendorId)
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.FORBIDDEN_ACCESS, http_status_code_1.HTTP_STATUS.FORBIDDEN);
            yield this._chatRepo.findOneAndUpdate({ _id: (0, objectId_helper_1.toObjectId)(chatId) }, { vendorLastReadAt: new Date() });
        });
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IChatRepository')),
    __param(1, (0, tsyringe_1.inject)('IMessageRepository')),
    __param(2, (0, tsyringe_1.inject)('IUserRepository')),
    __metadata("design:paramtypes", [Object, Object, Object])
], ChatService);
