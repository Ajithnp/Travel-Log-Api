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
exports.AdminUserController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const tsyringe_1 = require("tsyringe");
const http_status_code_1 = require("../../shared/constants/http_status_code");
const messages_1 = require("../../shared/constants/messages");
const jwt_token_1 = require("../../shared/constants/jwt.token");
const roles_1 = require("../../shared/constants/roles");
const pagination_helper_1 = require("../../shared/utils/pagination.helper");
let AdminUserController = class AdminUserController {
    constructor(_adminUserService) {
        this._adminUserService = _adminUserService;
        this.getAllUsers = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { page, limit, search, selectedFilter } = (0, pagination_helper_1.getPaginationOptions)(req);
            const users = yield this._adminUserService.fetchUsers(page, limit, roles_1.USER_ROLES.USER, search, selectedFilter);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data: users,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.blockOrUnblockUser = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { userId } = req.params;
            const { blockUser, reason } = req.body;
            const accessToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a[jwt_token_1.JWT_TOKEN.ACCESS_TOKEN];
            if (blockUser && accessToken) {
                yield this._adminUserService.updateUserAccess(userId, blockUser, reason, accessToken);
            }
            else {
                yield this._adminUserService.updateUserAccess(userId, blockUser, reason);
            }
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: blockUser
                    ? messages_1.SUCCESS_MESSAGES.USER_BLOCKED_SUCCESS
                    : messages_1.SUCCESS_MESSAGES.USER_UNBLOCKED_SUCCESS,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.getCancellationRequests = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { page, limit } = (0, pagination_helper_1.getPaginationOptions)(req);
            const { status } = req.query;
            const requests = yield this._adminUserService.getCancellationRequests(page, limit, status);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data: requests,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.getCancellationRequestDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { bookingId } = req.params;
            const requestDetails = yield this._adminUserService.getCancellationRequestDetails(bookingId);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data: requestDetails,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.rejectCancellationRequest = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { bookingId } = req.params;
            const adminId = req.user.id;
            const { reason } = req.body;
            yield this._adminUserService.rejectCancellationRequest(bookingId, adminId, reason);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.CANCELLATION_REQUEST_REJECETED,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.approveCancellationRequest = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { bookingId } = req.params;
            yield this._adminUserService.approveCancellationRequest(bookingId);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.CANCELLATION_REQUEST_APPROVED,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
    }
};
exports.AdminUserController = AdminUserController;
exports.AdminUserController = AdminUserController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IAdminUserService')),
    __metadata("design:paramtypes", [Object])
], AdminUserController);
