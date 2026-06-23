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
exports.VendorController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const tsyringe_1 = require("tsyringe");
const messages_1 = require("../../shared/constants/messages");
const http_status_code_1 = require("../../shared/constants/http_status_code");
const http_status_code_2 = require("../../shared/constants/http_status_code");
let VendorController = class VendorController {
    constructor(_vendorService, _vendorVerificationService) {
        this._vendorService = _vendorService;
        this._vendorVerificationService = _vendorVerificationService;
        this.profile = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const vendor = yield this._vendorService.profile(req.user.id);
            const successResponse = {
                success: http_status_code_2.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data: vendor,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        //====================================================================================
        this.updateProfileLogo = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { files, vendorInfoId } = req.body;
            yield this._vendorService.updateProfileLogo(req.user.id, { files, vendorInfoId });
            const successResponse = {
                success: http_status_code_2.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        //=====================================================================================
        this.vendorVerificationSubmit = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const payload = req.body;
            const result = yield this._vendorVerificationService.vendorVerificationSubmit(req.user.id, payload);
            const successResponse = {
                success: http_status_code_2.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.VERIFICATION_FORM_UPLOAD_SUCCESSFULLY,
                data: {
                    isProfileVerified: result.isProfileVerified,
                },
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        //===========================================================================
        this.getRejectedVendor = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const vendorId = req.params.vendorId;
            const result = yield this._vendorVerificationService.getRejectedVendor(vendorId);
            const successResponse = {
                success: http_status_code_2.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.VERIFICATION_FORM_UPLOAD_SUCCESSFULLY,
                data: result,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.vendorVerificationReapply = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { vendorInfoId } = req.params;
            const result = yield this._vendorVerificationService.vendorVerificationReapply(req.user.id, vendorInfoId, req.body);
            const successResponse = {
                success: http_status_code_2.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.VERIFICATION_FORM_UPLOAD_SUCCESSFULLY,
                data: result,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.getVendorSummaryStats = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const result = yield this._vendorService.getSummaryStats(vendorId);
            const successResponse = {
                success: http_status_code_2.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data: result,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.dashboardAnalytics = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { period, start, end } = req.query;
            const result = yield this._vendorService.getDashboardAnalytics(vendorId, period, start ? new Date(start) : undefined, end ? new Date(end) : undefined);
            const successResponse = {
                success: http_status_code_2.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data: result,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.dashboardRecentActivity = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const result = yield this._vendorService.dashboardRecentActivity(vendorId);
            const successResponse = {
                success: http_status_code_2.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data: result,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
    }
};
exports.VendorController = VendorController;
exports.VendorController = VendorController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IVendorService')),
    __param(1, (0, tsyringe_1.inject)('IVendorVerificationService')),
    __metadata("design:paramtypes", [Object, Object])
], VendorController);
