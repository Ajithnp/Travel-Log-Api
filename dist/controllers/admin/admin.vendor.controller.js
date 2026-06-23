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
exports.AdminVendorController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const tsyringe_1 = require("tsyringe");
const http_status_code_1 = require("../../shared/constants/http_status_code");
const messages_1 = require("../../shared/constants/messages");
const vendor_verfication_status_enum_1 = require("../../types/enum/vendor-verfication-status.enum");
const pagination_helper_1 = require("../../shared/utils/pagination.helper");
let AdminVendorController = class AdminVendorController {
    constructor(_adminVendorService, _adminUserService) {
        this._adminVendorService = _adminVendorService;
        this._adminUserService = _adminUserService;
        this.vendorVerificationRequest = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { page, limit, search, selectedFilter } = (0, pagination_helper_1.getPaginationOptions)(req);
            const data = yield this._adminVendorService.vendorVerificationRequests(page, limit, search, selectedFilter);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.updateVendorVerification = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { vendorId } = req.params;
            const { status, reasonForReject } = req.body;
            yield this._adminVendorService.updateVendorVerification(vendorId, {
                status,
                reasonForReject,
            });
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: status === vendor_verfication_status_enum_1.VENDOR_VERIFICATION_STATUS.APPROVED
                    ? messages_1.SUCCESS_MESSAGES.VENDOR_VERIFICATION_SUCCESS
                    : messages_1.SUCCESS_MESSAGES.VENDOR_VERIFICATION_REJECTED,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.getVendors = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { page, limit, search, selectedFilter } = (0, pagination_helper_1.getPaginationOptions)(req);
            const vendors = yield this._adminVendorService.getVendors(page, limit, search, selectedFilter);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data: vendors,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.getVendorProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { vendorId } = req.params;
            const vendorProfile = yield this._adminVendorService.getVendorProfile(vendorId);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data: vendorProfile,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.getVendorProfileStats = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { vendorId } = req.params;
            const vendorProfileStats = yield this._adminVendorService.getVendorProfileStats(vendorId);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data: vendorProfileStats,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
    }
};
exports.AdminVendorController = AdminVendorController;
exports.AdminVendorController = AdminVendorController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IAdminVendorService')),
    __param(1, (0, tsyringe_1.inject)('IAdminUserService')),
    __metadata("design:paramtypes", [Object, Object])
], AdminVendorController);
