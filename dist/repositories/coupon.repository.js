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
exports.CouponRepository = void 0;
const tsyringe_1 = require("tsyringe");
const base_repository_1 = require("./base.repository");
const coupon_template_model_1 = require("../models/coupon-template.model");
let CouponRepository = class CouponRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(coupon_template_model_1.CouponTemplateModel);
    }
    findAllActiveCoupons() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.find({ isActive: true });
        });
    }
    findAllCoupons(page, limit, search, isActive) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {};
            const skip = (page - 1) * limit;
            if (search) {
                query.title = { $regex: search, $options: 'i' };
            }
            if (isActive !== undefined) {
                query.isActive = isActive;
            }
            const [data, total] = yield Promise.all([
                this.model.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
                this.model.countDocuments(query),
            ]);
            return { data, total };
        });
    }
};
exports.CouponRepository = CouponRepository;
exports.CouponRepository = CouponRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], CouponRepository);
