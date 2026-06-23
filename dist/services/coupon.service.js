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
exports.CouponService = void 0;
const tsyringe_1 = require("tsyringe");
const mongoose_1 = __importDefault(require("mongoose"));
const constants_1 = require("../shared/constants/constants");
const logger_1 = __importDefault(require("../config/logger"));
const AppError_1 = require("../errors/AppError");
const messages_1 = require("../shared/constants/messages");
const http_status_code_1 = require("../shared/constants/http_status_code");
let CouponService = class CouponService {
    constructor(_userRewardRepository, _couponRepository) {
        this._userRewardRepository = _userRewardRepository;
        this._couponRepository = _couponRepository;
    }
    createCoupon(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingCoupon = yield this._couponRepository.findOne({
                title: payload.title,
                isActive: true,
                rewardValue: payload.rewardValue,
                probability: payload.probability,
            });
            if (existingCoupon) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.COUPON_EXIST_WITH_SAME_CRITERIA, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            const newCoupon = yield this._couponRepository.create(Object.assign({}, payload));
            return {
                title: newCoupon.title,
                rewardValue: newCoupon.rewardValue,
                probability: newCoupon.probability,
            };
        });
    }
    deActivateCoupon(couponId) {
        return __awaiter(this, void 0, void 0, function* () {
            const coupon = yield this._couponRepository.findById(couponId);
            if (!coupon) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.COUPON_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            if (!coupon.isActive) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.COUPON_ALREADY_DEACTIVATED, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            yield this._couponRepository.findByIdAndUpdate(couponId, { isActive: false });
        });
    }
    getAllCoupons(page, limit, search, isActive) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, total } = yield this._couponRepository.findAllCoupons(page, limit, search, isActive);
            const [activeCount, inactiveCount] = yield Promise.all([
                this._couponRepository.countDocuments({ isActive: true }),
                this._couponRepository.countDocuments({ isActive: false }),
            ]);
            const coupons = data.map((coupon) => ({
                id: coupon._id.toString(),
                title: coupon.title,
                rewardValue: coupon.rewardValue,
                probability: coupon.probability,
                isActive: coupon.isActive,
            }));
            return {
                data: coupons,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalDocs: total,
                activeCount,
                inactiveCount,
            };
        });
    }
    processLuckyDrawCoupons(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('coupon service reached-------- heyyyy');
            const activeTemplates = yield this._couponRepository.findAllActiveCoupons();
            if (activeTemplates.length === 0)
                return;
            const probabilityValue = Math.random();
            let cumulativeProbability = 0;
            let wonTemplate = null;
            for (const template of activeTemplates) {
                cumulativeProbability += template.probability;
                if (probabilityValue <= cumulativeProbability) {
                    wonTemplate = template;
                    break;
                }
            }
            if (wonTemplate) {
                yield this._userRewardRepository.create({
                    userId: new mongoose_1.default.Types.ObjectId(userId),
                    templateId: wonTemplate._id,
                    status: constants_1.USER_REWARD_STATUS.UNREVEALED,
                });
                logger_1.default.info(`User ${userId} won reward: ${wonTemplate.title}`);
            }
            else {
                logger_1.default.info(`User ${userId} did not win this time. Better luck next time`);
            }
        });
    }
};
exports.CouponService = CouponService;
exports.CouponService = CouponService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IUserRewardRepository')),
    __param(1, (0, tsyringe_1.inject)('ICouponRepository')),
    __metadata("design:paramtypes", [Object, Object])
], CouponService);
