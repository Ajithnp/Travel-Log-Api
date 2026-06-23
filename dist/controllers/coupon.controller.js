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
exports.CouponController = void 0;
const tsyringe_1 = require("tsyringe");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_status_code_1 = require("../shared/constants/http_status_code");
const messages_1 = require("../shared/constants/messages");
const pagination_helper_1 = require("../shared/utils/pagination.helper");
let CouponController = class CouponController {
    constructor(_couponService, _rewardService) {
        this._couponService = _couponService;
        this._rewardService = _rewardService;
        this.createCoupon = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const payload = req.body;
            const newCoupon = yield this._couponService.createCoupon(payload);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.COUPON_CREATED,
                data: newCoupon,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.deActivateCoupon = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const couponId = req.params.couponId;
            yield this._couponService.deActivateCoupon(couponId);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.COUPON_DEACTIVATED,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.getAllCoupons = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { page, limit, search } = (0, pagination_helper_1.getPaginationOptions)(req);
            const activeFilter = req.query.isActive;
            const isActive = activeFilter === 'true' ? true : activeFilter === 'false' ? false : undefined;
            const coupons = yield this._couponService.getAllCoupons(page, limit, search, isActive);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
                data: coupons,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.getUserReward = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const reward = yield this._rewardService.getUnrevealedReward(userId);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.COUPON_DEACTIVATED,
                data: reward,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.revealReward = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const rewardId = req.params.rewardId;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            yield this._rewardService.revealReward(rewardId, userId);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OK,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
    }
};
exports.CouponController = CouponController;
exports.CouponController = CouponController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ICouponService')),
    __param(1, (0, tsyringe_1.inject)('IRewardService')),
    __metadata("design:paramtypes", [Object, Object])
], CouponController);
