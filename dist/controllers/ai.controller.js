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
exports.AIController = void 0;
const tsyringe_1 = require("tsyringe");
const http_status_code_1 = require("../shared/constants/http_status_code");
const messages_1 = require("../shared/constants/messages");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const format_ai_chat_history_1 = require("../shared/utils/format-ai-chat-history");
let AIController = class AIController {
    constructor(_ragService, _recommendationService) {
        this._ragService = _ragService;
        this._recommendationService = _recommendationService;
        this.askChatbot = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { message, chatHistory } = req.body;
            const validatedHistory = (0, format_ai_chat_history_1.validateChatHistory)(chatHistory);
            const data = yield this._ragService.askChatbot(message, validatedHistory);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.getRecommendedPackages = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            //  const userId:string = req.user?.id;
            const userId = '693f90f3988c22ce3b927138';
            const data = yield this._recommendationService.getRecommendedPackages(userId);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
    }
};
exports.AIController = AIController;
exports.AIController = AIController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IRagService')),
    __param(1, (0, tsyringe_1.inject)('IRecommendationService')),
    __metadata("design:paramtypes", [Object, Object])
], AIController);
