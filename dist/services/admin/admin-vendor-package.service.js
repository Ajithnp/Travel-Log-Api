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
exports.AdminVendorPackageOversightService = void 0;
const tsyringe_1 = require("tsyringe");
const constants_1 = require("../../shared/constants/constants");
const AppError_1 = require("../../errors/AppError");
const messages_1 = require("../../shared/constants/messages");
const http_status_code_1 = require("../../shared/constants/http_status_code");
let AdminVendorPackageOversightService = class AdminVendorPackageOversightService {
    constructor(_basePackageRepository, _schedulePackageRepository) {
        this._basePackageRepository = _basePackageRepository;
        this._schedulePackageRepository = _schedulePackageRepository;
    }
    getPackages(page, limit, search) {
        return __awaiter(this, void 0, void 0, function* () {
            const [{ packages, total }, totalPublished] = yield Promise.all([
                this._basePackageRepository.getPackagesOversight(page, limit, search),
                this._basePackageRepository.countDocuments({
                    status: constants_1.PACKAGE_STATUS.PUBLISHED,
                    isDeleted: false,
                }),
            ]);
            return {
                data: packages,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalDocs: total,
                totalPublished,
            };
        });
    }
    getPackageDetails(packageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this._basePackageRepository.getPackageDetails(packageId);
            if (!data) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PACKAGE_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            return data;
        });
    }
    getPackageSchedules(packageId, page, limit, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const { schedules, total } = yield this._schedulePackageRepository.getPackageSchedules(packageId, page, limit, filter);
            return {
                data: schedules,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalDocs: total,
            };
        });
    }
    getPackageScheduleStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const [totalSchedules, upcomingSchedules, completedSchedules, soldOutSchedules] = yield Promise.all([
                this._schedulePackageRepository.countDocuments({}),
                this._schedulePackageRepository.countDocuments({ status: constants_1.SCHEDULE_STATUS.UPCOMING }),
                this._schedulePackageRepository.countDocuments({ status: constants_1.SCHEDULE_STATUS.COMPLETED }),
                this._schedulePackageRepository.countDocuments({ status: constants_1.SCHEDULE_STATUS.SOLD_OUT }),
            ]);
            return {
                totalSchedules,
                upcomingSchedules,
                completedSchedules,
                soldOutSchedules,
            };
        });
    }
    getSchedules(page, limit, filter, search) {
        return __awaiter(this, void 0, void 0, function* () {
            const { schedules, total } = yield this._schedulePackageRepository.getSchedulesAll(page, limit, filter, search);
            return {
                data: schedules,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalDocs: total,
            };
        });
    }
};
exports.AdminVendorPackageOversightService = AdminVendorPackageOversightService;
exports.AdminVendorPackageOversightService = AdminVendorPackageOversightService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IBasePackageRepository')),
    __param(1, (0, tsyringe_1.inject)('ISchedulePackageRepository')),
    __metadata("design:paramtypes", [Object, Object])
], AdminVendorPackageOversightService);
