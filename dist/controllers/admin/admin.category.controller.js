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
exports.AdminCategoryController = void 0;
const tsyringe_1 = require("tsyringe");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const messages_1 = require("../../shared/constants/messages");
const http_status_code_1 = require("../../shared/constants/http_status_code");
const pagination_helper_1 = require("../../shared/utils/pagination.helper");
const constants_1 = require("../../shared/constants/constants");
let AdminCategoryController = class AdminCategoryController {
    constructor(_adminCategoryService) {
        this._adminCategoryService = _adminCategoryService;
        this.createCategory = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const adminId = req.user.id;
            const payload = req.body;
            yield this._adminCategoryService.createCategory(adminId, payload);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.CATEGORY_CREATED,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.updateCategory = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const adminId = req.user.id;
            const { id } = req.params;
            const payload = req.body;
            yield this._adminCategoryService.updateCategory(adminId, id, payload);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.CATEGORY_UPDATED,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.toggleCategoryStatus = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const isActivated = yield this._adminCategoryService.toggleCategoryStatus(id);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: isActivated
                    ? messages_1.SUCCESS_MESSAGES.CATEGORY_ACTIVATED
                    : messages_1.SUCCESS_MESSAGES.CATEGORY_DEACTIVATED,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.getAllCategories = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { page, limit, search, selectedFilter } = (0, pagination_helper_1.getPaginationOptions)(req);
            const filters = {
                status: selectedFilter,
                search,
                page,
                limit,
            };
            const result = yield this._adminCategoryService.getAllCategories(filters);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data: result,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.getPendingRequest = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { page, limit, search } = (0, pagination_helper_1.getPaginationOptions)(req);
            const result = yield this._adminCategoryService.getPendingRequests(page, limit, search);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data: result,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.reviewCategoryRequest = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const adminId = req.user.id;
            const { id } = req.params;
            const { action, rejectionReason } = req.body;
            yield this._adminCategoryService.reviewCategoryRequest(adminId, id, {
                action,
                rejectionReason,
            });
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: action === constants_1.APPROVE_REJECT_ACTIONS.APPROVE
                    ? messages_1.SUCCESS_MESSAGES.CATEGORY_REQUEST_APPROVED
                    : messages_1.SUCCESS_MESSAGES.CATEGORY_REQUEST_REJECTED,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.getReviwedRequest = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { page, limit, search, selectedFilter } = (0, pagination_helper_1.getPaginationOptions)(req);
            const result = yield this._adminCategoryService.getReviewedRequests(page, limit, search, selectedFilter);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data: result,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
    }
};
exports.AdminCategoryController = AdminCategoryController;
exports.AdminCategoryController = AdminCategoryController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IAdminCategoryService')),
    __metadata("design:paramtypes", [Object])
], AdminCategoryController);
