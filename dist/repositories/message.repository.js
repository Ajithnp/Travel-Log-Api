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
exports.MessageRepository = void 0;
const tsyringe_1 = require("tsyringe");
const message_model_1 = require("../models/message.model");
const base_repository_1 = require("./base.repository");
const mongoose_1 = require("mongoose");
let MessageRepository = class MessageRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(message_model_1.MessageModel);
    }
    // cursor based pagination
    findMessagesByChatId(chatId_1, cursor_1) {
        return __awaiter(this, arguments, void 0, function* (chatId, cursor, limit = 10) {
            const query = { chatId };
            if (cursor) {
                query._id = { $lt: cursor };
            }
            const messages = yield this.model
                .find(query)
                .sort({ _id: -1 })
                .limit(limit + 1)
                .lean();
            const hasMore = messages.length > limit;
            if (hasMore)
                messages.pop();
            const result = messages.reverse();
            const nextCursor = hasMore ? result[0]._id.toString() : null;
            return {
                messages: result,
                hasMore,
                nextCursor,
            };
        });
    }
    createTextMessage(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.create(Object.assign(Object.assign({}, data), { chatId: new mongoose_1.Types.ObjectId(data.chatId) }));
        });
    }
    getLastMessage(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.findOne({ chatId }).sort({ createdAt: -1 }).lean();
        });
    }
    deleteMessage(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.model.deleteOne({ _id: messageId });
            return result.deletedCount === 1;
        });
    }
    getMessageUnreadCount(chatId, senderRole, lastReadAt) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.countDocuments({
                chatId,
                senderRole,
                createdAt: { $gt: lastReadAt },
            });
        });
    }
};
exports.MessageRepository = MessageRepository;
exports.MessageRepository = MessageRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], MessageRepository);
