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
exports.SchedulePackageService = void 0;
const tsyringe_1 = require("tsyringe");
const objectId_helper_1 = require("../../shared/utils/database/objectId.helper");
const AppError_1 = require("../../errors/AppError");
const messages_1 = require("../../shared/constants/messages");
const http_status_code_1 = require("../../shared/constants/http_status_code");
const constants_1 = require("../../shared/constants/constants");
const schedule_mapper_1 = require("../../shared/mappers/schedule.mapper");
const mongoose_1 = __importDefault(require("mongoose"));
let SchedulePackageService = class SchedulePackageService {
    constructor(_schedulePackageRepository, _basePackageRepository, _bookingRepo) {
        this._schedulePackageRepository = _schedulePackageRepository;
        this._basePackageRepository = _basePackageRepository;
        this._bookingRepo = _bookingRepo;
    }
    validateDateRange(startDate, endDate, packageDurationDays) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // cannot schedule more than 4 months ahead
        const maxDate = new Date(today);
        maxDate.setMonth(maxDate.getMonth() + 4);
        if (startDate > maxDate) {
            throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.CANNOT_SCHEDULE_TRIPS_FOUR_MONTH_IN_ADVANCE, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
        }
        // Duration must match package duration
        const expectedNights = packageDurationDays - 1;
        const actualNights = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        if (actualNights !== expectedNights) {
            throw new AppError_1.AppError(`Package duration is ${packageDurationDays} days (${expectedNights} nights) but selected dates span ${actualNights} nights.`, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
        }
    }
    buildPricing(pricingInput) {
        const tiers = [];
        tiers.push({
            type: 'SOLO',
            peopleCount: 1,
            price: pricingInput.solo,
        });
        if (pricingInput.duo) {
            tiers.push({
                type: 'DUO',
                peopleCount: 2,
                price: pricingInput.duo,
            });
        }
        if (pricingInput.group) {
            tiers.push({
                type: 'GROUP',
                peopleCount: 4,
                price: pricingInput.group,
            });
        }
        return tiers;
    }
    createSchedule(vendorId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const pkdId = (0, objectId_helper_1.toObjectId)(data.packageId);
            const vendorObjId = (0, objectId_helper_1.toObjectId)(vendorId);
            const pkg = yield this._basePackageRepository.findOne({
                _id: pkdId,
                vendorId: vendorObjId,
            });
            if (!pkg) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PACKAGE_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            if (pkg.status !== constants_1.PACKAGE_STATUS.PUBLISHED) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PACKAGE_NOT_PUBLISHED, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            const startDate = new Date(data.startDate);
            const endDate = new Date(data.endDate);
            this.validateDateRange(startDate, endDate, Number(pkg.days));
            // Check for overlapping schedules on this same package
            // Two schedules for the same package cannot overlap
            const overlap = yield this._schedulePackageRepository.findOverlapping(data.packageId, startDate, endDate);
            if (overlap) {
                throw new AppError_1.AppError(`A schedule for this package already exists between ` +
                    `${overlap.startDate.toDateString()} and ${overlap.endDate.toDateString()}. ` +
                    `Dates cannot overlap.`, http_status_code_1.HTTP_STATUS.CONFLICT);
            }
            const pricing = this.buildPricing(data.pricing);
            yield this._schedulePackageRepository.create(Object.assign(Object.assign({}, data), { packageId: pkdId, vendorId: vendorObjId, pricing,
                startDate,
                endDate }));
        });
    }
    fetchVendorSchedules(vendorId, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const [{ schedules, total }, statusCounts] = yield Promise.all([
                this._schedulePackageRepository.findSchedulesWithPackage(filters, vendorId),
                this._schedulePackageRepository.getStatusCounts(vendorId),
            ]);
            return schedule_mapper_1.ScheduleMapper.toListResponse(schedules, total, filters.page, filters.limit, statusCounts);
        });
    }
    getSchedule(scheduleId, vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const schedule = yield this._schedulePackageRepository.findOne({
                _id: new mongoose_1.default.Types.ObjectId(scheduleId),
                vendorId: new mongoose_1.default.Types.ObjectId(vendorId),
            });
            if (!schedule) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.SCHEDULE_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            return schedule_mapper_1.ScheduleMapper.toResponse(schedule);
        });
    }
    getVendorScheduleBookingSummary(scheduleId, vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const schedule = yield this._schedulePackageRepository.findOnePopulated({
                _id: (0, objectId_helper_1.toObjectId)(scheduleId),
                vendorId: (0, objectId_helper_1.toObjectId)(vendorId),
            }, { path: 'packageId', select: 'title location state basePrice' });
            if (!schedule) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.SCHEDULE_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            const summary = yield this._bookingRepo.getVendorScheduleBookingSummary(scheduleId, vendorId);
            if (!summary) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.SCHEDULE_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            return schedule_mapper_1.ScheduleMapper.toBookingSummaryResponse(schedule, summary);
        });
    }
    getScheduleBookings(scheduleId, vendorId, page, limit, search, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._bookingRepo.findBookingsBySchedule(scheduleId, vendorId, page, limit, search, filter);
            return schedule_mapper_1.ScheduleMapper.toScheduleBookingListResponse(result, page, limit);
        });
    }
    getScheduleBookingDetails(scheduleId, bookingId, vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const booking = yield this._bookingRepo.getVendorBookingDetails(bookingId, scheduleId, vendorId);
            if (!booking) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.BOOKING_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            return schedule_mapper_1.ScheduleMapper.toScheduleBookingSingleDetail(booking);
        });
    }
    updateScheduleStatus(scheduleId, vendorId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const schedule = yield this._schedulePackageRepository.findById(scheduleId);
            if (!schedule) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.SCHEDULE_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            if (schedule.vendorId.toString() !== vendorId) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS, http_status_code_1.HTTP_STATUS.UNAUTHORIZED);
            }
            const updated = yield this._schedulePackageRepository.findByIdAndUpdate(scheduleId, { status: status }, { new: true });
            if (!updated) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.FAILED_TO_UPDATE_SCHEDULE_STATUS, http_status_code_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            return { status: updated.status };
        });
    }
};
exports.SchedulePackageService = SchedulePackageService;
exports.SchedulePackageService = SchedulePackageService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ISchedulePackageRepository')),
    __param(1, (0, tsyringe_1.inject)('IBasePackageRepository')),
    __param(2, (0, tsyringe_1.inject)('IBookingRepository')),
    __metadata("design:paramtypes", [Object, Object, Object])
], SchedulePackageService);
