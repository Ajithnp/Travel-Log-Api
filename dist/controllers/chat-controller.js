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
exports.ChatController = void 0;
const tsyringe_1 = require("tsyringe");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_status_code_1 = require("../shared/constants/http_status_code");
const messages_1 = require("../shared/constants/messages");
const mongoose_1 = require("mongoose");
let ChatController = class ChatController {
    constructor(_chatService) {
        this._chatService = _chatService;
        // ─── USER
        this.getUserChat = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.user.id;
            const chatId = req.params.chatId;
            const result = yield this._chatService.getUserChat(chatId, userId);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data: result,
            };
            res.status(http_status_code_1.HTTP_STATUS.CREATED).json(successResponse);
        }));
        this.getUserChatMessages = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const userId = new mongoose_1.Types.ObjectId(req.user.id);
            const chatId = new mongoose_1.Types.ObjectId(req.params.chatId);
            const cursor = req.query.cursor;
            const limit = parseInt(req.query.limit) || 10;
            const result = yield this._chatService.getUserChatMessages(chatId, userId, cursor, limit);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data: result,
            };
            res.status(http_status_code_1.HTTP_STATUS.CREATED).json(successResponse);
        }));
        this.sendUserMessage = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const userId = new mongoose_1.Types.ObjectId(req.user.id);
            const chatId = new mongoose_1.Types.ObjectId(req.params.chatId);
            const { content } = req.body;
            const senderName = req.user.name;
            const message = yield this._chatService.sendUserMessage(chatId, userId, senderName, content);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data: message,
            };
            res.status(http_status_code_1.HTTP_STATUS.CREATED).json(successResponse);
        }));
        // ─── VENDOR
        this.getVendorChats = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const vendorId = req.user.id;
            const status = req.query.status;
            const search = req.query.search;
            const chats = yield this._chatService.getVendorChats(vendorId, status, search);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data: chats,
            };
            res.status(http_status_code_1.HTTP_STATUS.CREATED).json(successResponse);
        }));
        this.getVendorChatMessages = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const vendorId = new mongoose_1.Types.ObjectId(req.user.id);
            const chatId = new mongoose_1.Types.ObjectId(req.params.chatId);
            const cursor = req.query.cursor;
            const limit = parseInt(req.query.limit) || 30;
            const result = yield this._chatService.getVendorChatMessages(chatId.toString(), vendorId.toString(), cursor, limit);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data: result,
            };
            res.status(http_status_code_1.HTTP_STATUS.CREATED).json(successResponse);
        }));
        this.sendVendorMessage = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const vendorId = req.user.id;
            const chatId = req.params.chatId;
            const { content } = req.body;
            const senderName = req.user.name;
            const message = yield this._chatService.sendVendorMessage(chatId, vendorId, senderName, content);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data: message,
            };
            res.status(http_status_code_1.HTTP_STATUS.CREATED).json(successResponse);
        }));
        this.pinMessage = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const vendorId = req.user.id;
            const chatId = req.params.chatId;
            const message = req.body.message;
            const updated = yield this._chatService.pinMessage(chatId, vendorId, message);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data: updated,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.removeMember = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const vendorId = req.user.id;
            const chatId = req.params.chatId;
            const userId = req.params.userId;
            yield this._chatService.removeMember(chatId, vendorId, userId);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data: null,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.archiveChat = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const vendorId = req.user.id;
            const chatId = req.params.chatId;
            yield this._chatService.archiveRoom(chatId, vendorId);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data: null,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.getChatMembers = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const vendorId = req.user.id;
            const chatId = req.params.chatId;
            const result = yield this._chatService.getChatMembers(chatId, vendorId);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data: result,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.markChatAsReadForVendor = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const vendorId = req.user.id;
            const chatId = req.params.chatId;
            yield this._chatService.markChatAsReadForVendor(chatId, vendorId);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
    }
};
exports.ChatController = ChatController;
exports.ChatController = ChatController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IChatService')),
    __metadata("design:paramtypes", [Object])
], ChatController);
