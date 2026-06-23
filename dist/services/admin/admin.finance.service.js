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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminFinanceService = void 0;
const tsyringe_1 = require("tsyringe");
const cache_1 = require("../../types/cache");
let AdminFinanceService = class AdminFinanceService {
    constructor(_bookingRepository, _vendorRepository, _cacheService, _basePackageRepository) {
        this._bookingRepository = _bookingRepository;
        this._vendorRepository = _vendorRepository;
        this._cacheService = _cacheService;
        this._basePackageRepository = _basePackageRepository;
    }
    getCommissionOverview() {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = cache_1.CACHE_KEYS.commissionOverview;
            const ttl = cache_1.CACHE_TTL.ttl_5_minutes;
            const cachedData = yield this._cacheService.get(cacheKey);
            if (cachedData) {
                return cachedData;
            }
            const data = yield this._bookingRepository.getCommissionOverview();
            yield this._cacheService.set(cacheKey, data, ttl);
            return data;
        });
    }
    getCommissionsByVendors(page, limit, search) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._vendorRepository.getCommissionOverviewByVendors(page, limit, search);
        });
    }
    getCommissionsByVendorsPackages(page, limit, search) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this._basePackageRepository.getCommissionOverviewByPackages(page, limit, search);
            return data;
        });
    }
};
exports.AdminFinanceService = AdminFinanceService;
exports.AdminFinanceService = AdminFinanceService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IBookingRepository')),
    __param(1, (0, tsyringe_1.inject)('IVendorInfoRepository')),
    __param(2, (0, tsyringe_1.inject)('ICacheService')),
    __param(3, (0, tsyringe_1.inject)('IBasePackageRepository')),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], AdminFinanceService);
