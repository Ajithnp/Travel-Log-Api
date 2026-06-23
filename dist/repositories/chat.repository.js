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
exports.ChatRepository = void 0;
const tsyringe_1 = require("tsyringe");
const base_repository_1 = require("./base.repository");
const chat_model_1 = require("../models/chat.model");
let ChatRepository = class ChatRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(chat_model_1.ChatModel);
    }
    findChatRoomByScheduleId(scheduleId, session) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findOne({ scheduleId }).session(session || null);
        });
    }
    findRoomById(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findById(chatId).lean();
        });
    }
    findRoomByMemberId(chatId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findOne({ _id: chatId, 'members.userId': userId }).lean();
        });
    }
    createRoom(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.create({
                chatName: data.chatName,
                scheduleId: data.scheduleId,
                packageId: data.packageId,
                vendorId: data.vendorId,
                members: [{ userId: data.userId, joinedAt: new Date(), isActive: true }],
                status: 'active',
            });
        });
    }
    isMember(chatId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield this.countDocuments({
                _id: chatId,
                'members.userId': userId,
            });
            return count > 0;
        });
    }
    addMember(chatId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.findByIdAndUpdate(chatId, {
                $push: { members: { userId, joinedAt: new Date(), isActive: true } },
            }, { new: true });
        });
    }
    findRoomsByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model
                .find({
                'members.userId': userId,
            })
                .populate('scheduleId', 'startDate endDate')
                .populate('packageId', 'name')
                .populate('vendorId', 'name')
                .sort({ updatedAt: -1 })
                .lean();
        });
    }
    findRoomsByVendorId(vendorId, status, search) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = { vendorId };
            if (status)
                query.status = status;
            if (search)
                query.chatName = { $regex: search, $options: 'i' };
            return yield this.model
                .find(query)
                .populate('scheduleId', 'startDate endDate')
                .populate('packageId', 'name')
                .sort({ updatedAt: -1 })
                .lean();
        });
    }
    isActiveMember(chatId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const room = yield this.model
                .findOne({
                _id: chatId,
                members: { $elemMatch: { userId, isActive: true } },
            })
                .lean();
            return !!room;
        });
    }
    pinMessage(chatId, message) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model
                .findByIdAndUpdate(chatId, { pinnedMessage: message }, { new: true })
                .lean();
        });
    }
    deactivateMember(chatId, userId, session) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model
                .findOneAndUpdate({ _id: chatId, 'members.userId': userId }, { $set: { 'members.$.isActive': false } }, { new: true, session })
                .lean();
        });
    }
    archiveRoom(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model
                .findByIdAndUpdate(chatId, { status: 'archived', archivedAt: new Date() }, { new: true })
                .lean();
        });
    }
    canAccessRoom(chatId, userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            if (role === 'vendor') {
                const room = yield this.model
                    .findOne({
                    _id: chatId,
                    vendorId: userId,
                })
                    .lean();
                return !!room;
            }
            const room = yield this.model
                .findOne({
                _id: chatId,
                'members.userId': userId,
            })
                .lean();
            return !!room;
        });
    }
    getRoomWithMembers(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model
                .findById(chatId)
                .populate('members.userId', 'name')
                .lean();
        });
    }
};
exports.ChatRepository = ChatRepository;
exports.ChatRepository = ChatRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], ChatRepository);
